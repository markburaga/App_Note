# Ghidra Jython script - run in Script Manager of YOUR open CodeBrowser.
# Builds the bridge: calibration/map address  ->  functions that read it.
# Tuned for EDC17CV44 (TC1767), base 0x80000000.
#
# Usage:
#   1) Window -> Script Manager -> (folder icon) add this file's dir -> Refresh
#   2) Double-click FindCalibRefs.py
#   3) It writes two reports and also prints a summary in the console.
#
# @category EDC17

from ghidra.program.model.address import AddressSet

CAL_LO = 0x80040000   # calibration / map data region (from entropy map)
CAL_HI = 0x800A0000
OUTDIR = "/tmp"       # change if you like

fm   = currentProgram.getFunctionManager()
refm = currentProgram.getReferenceManager()
af   = currentProgram.getAddressFactory()

def inCal(a):
    off = a.getOffset()
    return CAL_LO <= off < CAL_HI

# 1) For every reference FROM code INTO the calibration region, record it.
map2funcs = {}   # cal addr -> set(function names)
func2maps = {}   # function  -> set(cal addr)

it = refm.getReferenceIterator(af.getAddress(hex(0x80000000)))
count = 0
ref_it = refm.getReferencesTo  # not used; we iterate all refs below

# iterate all references in program
for ref in refm.getReferenceIterator(currentProgram.getMinAddress()):
    to = ref.getToAddress()
    if to is None or not inCal(to):
        continue
    frm = ref.getFromAddress()
    fn  = fm.getFunctionContaining(frm)
    fname = fn.getName() if fn else ("(none)@"+str(frm))
    key = to.getOffset()
    map2funcs.setdefault(key, set()).add(fname)
    func2maps.setdefault(fname, set()).add(key)
    count += 1

print("Calibration references found: %d" % count)
print("Distinct calibration addresses referenced: %d" % len(map2funcs))
print("Functions touching calibration: %d" % len(func2maps))

# 2) Report A: map address -> functions
fa = open(OUTDIR + "/edc17_map_to_funcs.txt", "w")
for addr in sorted(map2funcs):
    fa.write("0x%08x\t%s\n" % (addr, ", ".join(sorted(map2funcs[addr]))))
fa.close()

# 3) Report B: function -> how many maps it reads (calibration-heavy funcs first)
fb = open(OUTDIR + "/edc17_func_calib_density.txt", "w")
for fn in sorted(func2maps, key=lambda k: -len(func2maps[k])):
    fb.write("%4d\t%s\n" % (len(func2maps[fn]), fn))
fb.close()

print("Wrote: %s/edc17_map_to_funcs.txt" % OUTDIR)
print("Wrote: %s/edc17_func_calib_density.txt" % OUTDIR)

# 4) Quick helper: list functions reading specific candidate emissions axes.
#    Paste the map addresses you want to trace here:
AXES_OF_INTEREST = [0x80041cca,0x80041d6e,0x80041e12,0x80042828,0x80042f80,
                    0x80046e5c,0x8004709c,0x80047224,0x80041604,0x80041abe]
print("\n--- functions reading candidate emissions/NOx axes ---")
for a in AXES_OF_INTEREST:
    fns = map2funcs.get(a)
    # also check a small window after the axis (map body often referenced at axis-16)
    print("0x%08x : %s" % (a, ", ".join(sorted(fns)) if fns else "(no direct ref - try References->to in GUI)"))
