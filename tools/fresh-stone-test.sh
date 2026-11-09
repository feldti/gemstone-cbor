#!/usr/bin/env bash
# Load the CBOR library into a brand-new stone and run all test suites.
#
# Usage:
#   tools/fresh-stone-test.sh <GemStone product dir> [keyfile] [work dir]
#
# Modes (environment variable LOADER):
#   LOADER=topaz     (default) copy of the empty extent0.dbf (kernel classes only),
#                    load the Topaz fileouts in src/
#   LOADER=metacello copy of extent0.seaside.dbf (GLASS with Metacello + FileTree),
#                    load BaselineOfCbor from the FileTree repository in repository/
#
# Examples:
#   tools/fresh-stone-test.sh ~/Documents/GemStone/GemStone64Bit3.7.5-x86_64.Linux
#   LOADER=metacello tools/fresh-stone-test.sh ~/Documents/GemStone/GemStone64Bit3.7.5-x86_64.Linux
#
# The stone runs isolated (own GEMSTONE_GLOBAL_DIR, own name "cborfresh") so it
# does not interfere with other stones. It is stopped at the end; the work dir
# (default: a new temp dir) is removed unless KEEP=1 is set.
# Exit status: 0 if every test passed, 1 otherwise.

set -euo pipefail

PRODUCT=${1:?usage: $0 <GemStone product dir> [keyfile] [work dir]}
KEYFILE=${2:-$PRODUCT/sys/community.starter.key}
WORK=${3:-$(mktemp -d -t cborfresh.XXXXXX)}
REPO=$(cd "$(dirname "$0")/.." && pwd)
STONE=cborfresh
LOADER=${LOADER:-topaz}
case "$LOADER" in
  topaz)     EXTENT=extent0.dbf ;;
  metacello) EXTENT=extent0.seaside.dbf ;;
  *) echo "unknown LOADER '$LOADER' (topaz|metacello)" >&2; exit 2 ;;
esac

mkdir -p "$WORK/data" "$WORK/log" "$WORK/global/locks" "$WORK/global/log"
cp "$PRODUCT/bin/$EXTENT" "$WORK/data/extent0.dbf"
chmod u+w "$WORK/data/extent0.dbf"
rm -f "$WORK"/data/tranlog*.dbf

cat > "$WORK/$STONE.conf" <<EOF
DBF_EXTENT_NAMES = $WORK/data/extent0.dbf;
STN_TRAN_FULL_LOGGING = FALSE;
STN_TRAN_LOG_DIRECTORIES = $WORK/data/, $WORK/data/;
STN_TRAN_LOG_SIZES = 100, 100;
SHR_PAGE_CACHE_SIZE_KB = 100000;
KEYFILE = "$KEYFILE";
EOF

export GEMSTONE=$PRODUCT
export GEMSTONE_GLOBAL_DIR=$WORK/global
export GEMSTONE_SYS_CONF=$WORK/$STONE.conf
export GEMSTONE_EXE_CONF=$WORK/$STONE.conf
export GEMSTONE_LOG=$WORK/log/$STONE.log
export PATH=$GEMSTONE/bin:$PATH

cleanup() {
  stopstone -i "$STONE" DataCurator swordfish >/dev/null 2>&1 || true
  if [ "${KEEP:-0}" != 1 ]; then rm -rf "$WORK"; else echo "work dir kept: $WORK"; fi
}
trap cleanup EXIT

startstone -e "$WORK/$STONE.conf" -z "$WORK/$STONE.conf" -l "$WORK/log/$STONE.log" "$STONE" >/dev/null

topaz -l -q > "$WORK/log/topaz.out" 2>&1 <<EOF
set gemstone $STONE user DataCurator pass swordfish
login
output push $WORK/log/load.out only
$(if [ "$LOADER" = metacello ]; then cat <<MC
run
Metacello new
	baseline: 'Cbor';
	repository: 'filetree://$REPO/repository';
	load.
%
MC
else cat <<GS
input $REPO/src/CborLibrary.gs
input $REPO/src/CborVectorTest-vectors.gs
GS
fi)
output pop
commit
run
| ws total bad |
ws := WriteStream on: String new.
total := 0. bad := 0.
{CborTest. CborTypeRegistryTest. CborVectorTest} do: [:cls | | r |
	r := cls suite run.
	total := total + r runCount.
	bad := bad + r failureCount + r errorCount.
	ws nextPutAll: 'RESULT '; nextPutAll: cls name; nextPutAll: ': '; print: r runCount; nextPutAll: ' run, ';
		print: r passedCount; nextPutAll: ' passed, ';
		print: r failureCount; nextPutAll: ' failures, ';
		print: r errorCount; nextPutAll: ' errors'; lf.
	r failures do: [:t | ws nextPutAll: 'RESULT   FAIL  '; nextPutAll: t selector; lf].
	r errors do: [:t | ws nextPutAll: 'RESULT   ERROR '; nextPutAll: t selector; lf]].
ws nextPutAll: 'RESULT TOTAL: '; print: total; nextPutAll: ' run, '; print: bad; nextPutAll: ' not passed'; lf.
ws contents
%
logout
exit
EOF

# Compile problems while loading show up as topaz errors in load.out
if grep -n -E "^ ?\*|ERROR [0-9]+|undefined symbol" "$WORK/log/load.out" > "$WORK/log/load-errors.txt"; then
  echo "LOAD ERRORS:"; cat "$WORK/log/load-errors.txt"
fi
grep -E "^(\[[^]]*\] )?RESULT " "$WORK/log/topaz.out" | sed -E 's/^(\[[^]]*\] )?RESULT /  /'
grep -q "RESULT TOTAL: .* run, 0 not passed" "$WORK/log/topaz.out" && [ ! -s "$WORK/log/load-errors.txt" ]
