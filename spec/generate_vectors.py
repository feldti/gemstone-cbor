#!/usr/bin/env python3
"""Generate the shared CBOR test vectors for types.cddl.

Writes:
  spec/test-vectors.json        language-neutral vectors (hex + diagnostic notation)
  src/CborVectorTest-vectors.gs Topaz method CborVectorTest>>vectors for GemStone

The encoder below is deliberately self-contained (no third-party packages) so the
vectors come from an implementation independent of the libraries under test.
It produces RFC 8949 core deterministic encoding: preferred (shortest) heads,
definite lengths, map keys sorted bytewise by their encoding.

Usage:  python3 spec/generate_vectors.py
"""

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

POINT, CUSTOMER, ADDRESS = 40001, 40002, 40003


class Tag:
    def __init__(self, tag, value):
        self.tag = tag
        self.value = value


# ---------------------------------------------------------------- encoding

def _head(major, n):
    if n < 24:
        return bytes([(major << 5) | n])
    for info, size in ((24, 1), (25, 2), (26, 4), (27, 8)):
        if n < 1 << (8 * size):
            return bytes([(major << 5) | info]) + n.to_bytes(size, "big")
    raise ValueError("argument exceeds 64 bits")


def encode(v):
    if v is None:
        return b"\xf6"
    if v is True:
        return b"\xf5"
    if v is False:
        return b"\xf4"
    if isinstance(v, int):
        return _head(0, v) if v >= 0 else _head(1, -1 - v)
    if isinstance(v, bytes):
        return _head(2, len(v)) + v
    if isinstance(v, str):
        b = v.encode("utf-8")
        return _head(3, len(b)) + b
    if isinstance(v, list):
        return _head(4, len(v)) + b"".join(encode(x) for x in v)
    if isinstance(v, dict):
        items = sorted((encode(k), encode(x)) for k, x in v.items())
        return _head(5, len(items)) + b"".join(k + x for k, x in items)
    if isinstance(v, Tag):
        return _head(6, v.tag) + encode(v.value)
    raise TypeError(f"unsupported type {type(v)}")


def diag(v):
    """RFC 8949 section 8 diagnostic notation, map entries in encoded order."""
    if v is None:
        return "null"
    if v is True:
        return "true"
    if v is False:
        return "false"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, bytes):
        return "h'" + v.hex() + "'"
    if isinstance(v, str):
        return json.dumps(v, ensure_ascii=False)
    if isinstance(v, list):
        return "[" + ", ".join(diag(x) for x in v) + "]"
    if isinstance(v, dict):
        items = sorted(v.items(), key=lambda kv: encode(kv[0]))
        return "{" + ", ".join(f"{diag(k)}: {diag(x)}" for k, x in items) + "}"
    if isinstance(v, Tag):
        return f"{v.tag}({diag(v.value)})"
    raise TypeError(f"unsupported type {type(v)}")


# ---------------------------------------------------------------- domain helpers

def point(x, y):
    return Tag(POINT, [x, y])


def address(street, city, zip_code=None):
    m = {1: street, 2: city}
    if zip_code is not None:
        m[3] = zip_code
    return Tag(ADDRESS, m)


def customer(name, cid, addresses=None, created_at=None, extra=None):
    m = {1: name, 2: cid}
    if addresses is not None:
        m[3] = addresses
    if created_at is not None:
        m[4] = Tag(1, created_at)
    if extra:
        m.update(extra)
    return Tag(CUSTOMER, m)


# ---------------------------------------------------------------- vectors
# valid:     conforms to types.cddl
# roundtrip: decoding into domain objects and re-encoding deterministically
#            must reproduce exactly these bytes
# rule:      CDDL rule the item is checked against

VECTORS = [
    # name, rule, valid, roundtrip, value, note
    ("point-simple", "point", True, True, point(1, 2), "smallest point"),
    ("point-negative", "point", True, True, point(-1, -1000),
     "negative integers, two-byte argument"),
    ("point-large", "point", True, True, point(4294967296, -4294967297),
     "coordinates beyond 32 bits"),
    ("address-minimal", "address", True, True, address("Hauptstr. 1", "Berlin"),
     "optional zip omitted"),
    ("address-with-zip", "address", True, True, address("Hauptstr. 1", "Berlin", "10115"),
     "all fields"),
    ("customer-minimal", "customer", True, True, customer("Ada", 42),
     "required fields only"),
    ("customer-unicode", "customer", True, True, customer("Jürgen Müller", 7),
     "non-ASCII name, UTF-8 on the wire"),
    ("customer-full", "customer", True, True,
     customer("Grace Hopper", 1906,
              addresses=[address("Hauptstr. 1", "Berlin", "10115"),
                         address("Ringstr. 5", "Hamburg")],
              created_at=1363896240),
     "nested addresses and tag 1 timestamp"),
    ("customer-extension", "customer", True, False,
     customer("Ada", 42, extra={9: "added in v2"}),
     "unknown key 9 must be ignored by readers; it is lost on re-encoding"),
    ("messages-mixed", "messages", True, True,
     [point(1, 2), customer("Ada", 42), address("Hauptstr. 1", "Berlin")],
     "heterogeneous list of messages"),
    ("messages-empty", "messages", True, True, [], "empty list"),

    ("invalid-point-wrong-tag", "point", False, False, Tag(40009, [1, 2]),
     "unknown tag: readers keep it as a generic tagged value"),
    ("invalid-point-three-coordinates", "point", False, False, Tag(POINT, [1, 2, 3]),
     "array must have exactly two elements"),
    ("invalid-point-string-coordinate", "point", False, False, Tag(POINT, [1, "2"]),
     "coordinates must be integers"),
    ("invalid-customer-missing-id", "customer", False, False, Tag(CUSTOMER, {1: "Ada"}),
     "required key 2 missing"),
    ("invalid-customer-negative-id", "customer", False, False, customer("Ada", -5),
     "id must be an unsigned integer"),
    ("invalid-customer-empty-addresses", "customer", False, False,
     customer("Ada", 42, addresses=[]),
     "addresses must not be empty when present"),
    ("invalid-address-zip-too-long", "address", False, False,
     address("Hauptstr. 1", "Berlin", "101155"),
     "zip must be exactly 5 bytes"),
]


def main():
    vectors = []
    for name, rule, valid, roundtrip, value, note in VECTORS:
        vectors.append({
            "name": name,
            "rule": rule,
            "valid": valid,
            "roundtrip": roundtrip,
            "hex": encode(value).hex(),
            "diagnostic": diag(value),
            "note": note,
        })

    doc = {
        "description": "Shared CBOR test vectors for spec/types.cddl. "
                       "Generated by spec/generate_vectors.py - do not edit by hand.",
        "schema": "types.cddl",
        "tags": {str(POINT): "point", str(CUSTOMER): "customer", str(ADDRESS): "address"},
        "fields": {
            "valid": "item conforms to the CDDL rule",
            "roundtrip": "decode to domain objects + deterministic re-encode reproduces hex exactly",
        },
        "vectors": vectors,
    }
    json_path = ROOT / "spec" / "test-vectors.json"
    json_path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "! GENERATED by spec/generate_vectors.py from the shared test vectors - do not edit.",
        "! Load after CborLibrary.gs.",
        "",
        "category: 'vectors'",
        "method: CborVectorTest",
        "vectors",
        '\t"GENERATED by spec/generate_vectors.py - do not edit.',
        '\t Each entry: name, CDDL rule, valid, roundtrip, hex."',
        "",
        "\t^#(",
    ]
    for v in vectors:
        flags = f"{str(v['valid']).lower()} {str(v['roundtrip']).lower()}"
        lines.append(f"\t\t#('{v['name']}' '{v['rule']}' {flags} '{v['hex']}')")
    lines += ["\t)", "%", ""]
    gs_path = ROOT / "src" / "CborVectorTest-vectors.gs"
    gs_path.write_text("\n".join(lines), encoding="utf-8")

    print(f"wrote {len(vectors)} vectors to {json_path.relative_to(ROOT)} and {gs_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
