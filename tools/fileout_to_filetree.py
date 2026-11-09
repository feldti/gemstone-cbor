#!/usr/bin/env python3
"""Convert the Topaz fileouts in src/ into a Monticello FileTree (Cypress) repository.

The Topaz fileouts stay the source of truth; this script regenerates
repository/ from them so both formats always contain the same code:

  repository/
    .filetree
    BaselineOfCbor.package/     Metacello baseline
    Cbor-Core.package/          the library
    Cbor-Tests.package/         SUnit tests and test fixtures
    Cbor-Zinc-Examples.package/ HTTP examples/tests (group 'Zinc', needs Zinc)

Load into a GemStone image that has GLASS/GsDevKit Metacello + FileTree:

  Metacello new
    baseline: 'Cbor';
    repository: 'filetree:///path/to/gemstone-cbor/repository';
    load.

Usage:  python3 tools/fileout_to_filetree.py
"""

import hashlib
import json
import pathlib
import re
import shutil
import uuid

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILEOUTS = [ROOT / "src" / "CborLibrary.gs", ROOT / "src" / "CborVectorTest-vectors.gs",
            ROOT / "src" / "CborZincExamples.gs"]
OUT = ROOT / "repository"

CORE, TESTS, ZINC = "Cbor-Core", "Cbor-Tests", "Cbor-Zinc-Examples"
PACKAGE_OF = {
    "Cbor": CORE, "CborError": CORE, "CborTag": CORE, "CborSimpleValue": CORE,
    "CborEncoder": CORE, "CborTypedEncoder": CORE, "CborDecoder": CORE,
    "CborTypeMapping": CORE, "CborTypeRegistry": CORE,
    "CborTest": TESTS, "CborTypeRegistryTest": TESTS, "CborVectorTest": TESTS,
    "CborTestPoint": TESTS, "CborTestAddress": TESTS, "CborTestCustomer": TESTS,
    "CborHttpExample": ZINC, "CborZincExampleTest": ZINC,
}

COMMENTS = {
    "Cbor": "Facade for CBOR (RFC 8949) encoding and decoding: Cbor encode: / Cbor decode:.",
    "CborError": "Signalled for every encoding or decoding problem.",
    "CborTag": "A tagged CBOR data item (major type 6) that has no special Smalltalk mapping.",
    "CborSimpleValue": "A CBOR simple value (major type 7) other than false, true and null.",
    "CborEncoder": "Writes CBOR to a binary write stream.",
    "CborTypedEncoder": "Encoder that consults a CborTypeRegistry before the built-in type mapping.",
    "CborDecoder": "Reads CBOR from a binary read stream.",
    "CborTypeMapping": "One mapping between a class and a CBOR tag number or type name.",
    "CborTypeRegistry": "Central mapping of classes to CBOR tags (or tag 27 type names); "
                        "answers configured encoders and decoders.",
    "CborTest": "Tests for encoding and decoding, including the RFC 8949 Appendix A vectors.",
    "CborTypeRegistryTest": "Tests for CborTypeRegistry.",
    "CborVectorTest": "Runs the shared cross-language test vectors from spec/test-vectors.json.",
    "CborTestPoint": "Test fixture: point, tag 40001 in spec/types.cddl.",
    "CborTestAddress": "Test fixture: address, tag 40003 in spec/types.cddl.",
    "CborTestCustomer": "Test fixture: customer, tag 40002 in spec/types.cddl.",
    "CborHttpExample": "Example Zinc server speaking application/cbor (see docs/http.md). Requires Zinc.",
    "CborZincExampleTest": "Runs the HTTP examples from docs/http.md against a local Zinc server. Requires Zinc.",
}

BASELINE_SOURCE = """baseline: spec
	<baseline>
	spec for: #'common' do: [
		spec
			package: 'Cbor-Core';
			package: 'Cbor-Tests' with: [spec requires: #('Cbor-Core')];
			package: 'Cbor-Zinc-Examples' with: [spec requires: #('Cbor-Core' 'Cbor-Tests')].
		spec
			group: 'default' with: #('Core' 'Tests');
			group: 'Core' with: #('Cbor-Core');
			group: 'Tests' with: #('Cbor-Tests');
			group: 'Zinc' with: #('Cbor-Zinc-Examples')]"""

CLASS_DEF = re.compile(
    r"^run\n(\w+) subclass: '(\w+)'\n"
    r"\tinstVarNames: #\((.*?)\)\n"
    r"\tclassVars: #\((.*?)\)\n"
    r"\tclassInstVars: #\((.*?)\)\n"
    r"\tpoolDictionaries: #\((.*?)\)\n"
    r"\tinDictionary: \w+\n"
    r"\toptions: #\((.*?)\)\n%", re.M)
METHOD = re.compile(r"^category: '((?:[^']|'')*)'\n(method|classmethod): (\w+)\n(.*?)\n%\n", re.M | re.S)


def selector_of(source):
    first = source.split("\n", 1)[0].strip()
    tokens = first.split()
    if re.match(r"^[A-Za-z_]\w*:$", tokens[0]):
        return "".join(t for t in tokens if t.endswith(":"))
    return tokens[0]


def file_name_for(selector):
    """FileTree-style file name: ':' -> '.', binary selectors spelled out with a '^' prefix."""
    if re.match(r"^[A-Za-z_]", selector):
        return selector.replace(":", ".") + ".st"
    names = {"=": "equals", "<": "less", ">": "greater", "+": "plus", "-": "minus",
             "*": "star", "/": "slash", "\\": "backslash", "~": "tilde", ",": "comma",
             "@": "at", "%": "percent", "&": "and", "|": "pipe", "?": "wat"}
    return "^" + "".join(names[c] for c in selector) + ".st"


def json_text(obj):
    return json.dumps(obj, indent="\t", sort_keys=True, ensure_ascii=False) + "\n"


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def add_class(package_dir, name, superclass, category, instvars=(), classvars=(),
              classinstvars=(), pools=(), comment=""):
    cdir = package_dir / f"{name}.class"
    write(cdir / "properties.json", json_text({
        "category": category, "classinstvars": list(classinstvars), "classvars": list(classvars),
        "commentStamp": "", "instvars": list(instvars), "name": name, "pools": list(pools),
        "super": superclass, "type": "normal"}))
    write(cdir / "README.md", comment)
    return cdir


def add_method(cdir, is_meta, category, source):
    sub = "class" if is_meta else "instance"
    write(cdir / sub / file_name_for(selector_of(source)), category + "\n" + source)


def write_package_skeleton(name):
    pdir = OUT / f"{name}.package"
    write(pdir / "properties.json", json_text({}))
    return pdir


def write_monticello_meta(pdir, name):
    """Monticello metadata with a stable version id.

    Without monticello.meta the FileTree reader fabricates a new random version id
    on every read, so Metacello cannot find a fetched version again in its cache.
    The id is derived from the package content: unchanged code keeps its id,
    changed code gets a new one."""
    digest = hashlib.sha256()
    for f in sorted(pdir.rglob("*")):
        if f.is_file():
            digest.update(str(f.relative_to(pdir)).encode() + b"\0" + f.read_bytes())
    version_id = uuid.uuid5(uuid.NAMESPACE_URL, "gemstone-cbor/" + name + "/" + digest.hexdigest())
    meta = pdir / "monticello.meta"
    write(meta / "package", f"(name '{name}')")
    write(meta / "categories.st", f"SystemOrganization addCategory: #'{name}'!\n")
    write(meta / "initializers.st", "")
    write(meta / "version",
          f"(name '{name}-cbor.1' message 'generated by tools/fileout_to_filetree.py' "
          f"id '{version_id}' date '01/01/2026' time '12:00:00' author 'cbor' "
          f"ancestors () stepChildren ())")


def main():
    text = "\n".join(p.read_text(encoding="utf-8") for p in FILEOUTS)
    if OUT.exists():
        shutil.rmtree(OUT)
    write(OUT / ".filetree", json_text({"packageExtension": ".package", "propertyFileExtension": ".json"}))

    packages = {name: write_package_skeleton(name) for name in (CORE, TESTS, ZINC)}
    class_dirs = {}
    for superclass, name, iv, cv, civ, pools, _options in CLASS_DEF.findall(text):
        pkg = PACKAGE_OF[name]  # KeyError = new class without a package assignment
        class_dirs[name] = add_class(packages[pkg], name, superclass, pkg,
                                     iv.split(), cv.split(), civ.split(), pools.split(),
                                     COMMENTS.get(name, ""))

    counts = {}
    for category, kind, cls, source in METHOD.findall(text):
        add_method(class_dirs[cls], kind == "classmethod", category.replace("''", "'"), source)
        counts[PACKAGE_OF[cls]] = counts.get(PACKAGE_OF[cls], 0) + 1

    bdir = add_class(write_package_skeleton("BaselineOfCbor"), "BaselineOfCbor", "BaselineOf",
                     "BaselineOfCbor", comment="Metacello baseline for the CBOR library.")
    add_method(bdir, False, "baseline", BASELINE_SOURCE)

    for name in (CORE, TESTS, ZINC, "BaselineOfCbor"):
        write_monticello_meta(OUT / f"{name}.package", name)

    missing = set(PACKAGE_OF) - set(class_dirs)
    if missing:
        raise SystemExit(f"classes listed in PACKAGE_OF but not found in the fileouts: {sorted(missing)}")
    print(f"wrote {OUT.relative_to(ROOT)}: {len(class_dirs)} classes, "
          + ", ".join(f"{k} {v} methods" for k, v in sorted(counts.items())))


if __name__ == "__main__":
    main()
