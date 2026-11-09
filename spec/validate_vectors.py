#!/usr/bin/env python3
"""Validate spec/test-vectors.json against spec/types.cddl with the CDDL reference tool.

Each vector is written to a temporary .cbor file and checked with
`cddl spec/types.cddl validate <file>` (Ruby gem "cddl", start rule = first rule).
Valid vectors must pass, invalid vectors must fail. Exit status 0 if all agree.

Requires the gem:  gem install --user-install cddl
The cddl executable is looked up in $CDDL, then PATH, then the RubyGems user dir.

Usage:  python3 spec/validate_vectors.py
"""

import glob
import json
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCHEMA = ROOT / "spec" / "types.cddl"
VECTORS = ROOT / "spec" / "test-vectors.json"


def find_cddl():
    candidates = [os.environ.get("CDDL"), shutil.which("cddl")]
    candidates += sorted(glob.glob(os.path.expanduser("~/.local/share/gem/ruby/*/bin/cddl")))
    candidates += sorted(glob.glob(os.path.expanduser("~/.gem/ruby/*/bin/cddl")))
    for c in candidates:
        if c and os.access(c, os.X_OK):
            return c
    sys.exit("cddl tool not found: gem install --user-install cddl (or set $CDDL)")


def main():
    cddl = find_cddl()
    vectors = json.loads(VECTORS.read_text(encoding="utf-8"))["vectors"]
    failures = 0
    with tempfile.TemporaryDirectory() as tmp:
        for v in vectors:
            path = pathlib.Path(tmp) / (v["name"] + ".cbor")
            path.write_bytes(bytes.fromhex(v["hex"]))
            result = subprocess.run([cddl, str(SCHEMA), "validate", str(path)],
                                    capture_output=True, text=True)
            accepted = result.returncode == 0
            ok = accepted == v["valid"]
            failures += not ok
            verdict = "ok  " if ok else "FAIL"
            expected = "valid" if v["valid"] else "invalid"
            got = "accepted" if accepted else "rejected"
            print(f"{verdict} {v['name']:<36} expected {expected:<7}  cddl {got}")
            if not ok:
                print("     " + (result.stdout + result.stderr).strip().replace("\n", "\n     "))
    print(f"\n{len(vectors) - failures}/{len(vectors)} vectors agree with {SCHEMA.relative_to(ROOT)}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
