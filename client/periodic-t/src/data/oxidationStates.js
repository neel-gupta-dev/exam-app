// Common oxidation states for all 118 elements
// First value in each array is the most common oxidation state
const OXIDATION_STATES = {
  1:   [-1, +1],                          // H  - Hydrogen
  2:   [0],                               // He - Helium
  3:   [+1],                              // Li - Lithium
  4:   [+2],                              // Be - Beryllium
  5:   [+3],                              // B  - Boron
  6:   [+4, -4, +2, -2, +3, -3, -1, +1], // C  - Carbon
  7:   [-3, +3, +5, -2, -1, +1, +2, +4], // N  - Nitrogen
  8:   [-2, -1, +1, +2],                  // O  - Oxygen
  9:   [-1],                              // F  - Fluorine
  10:  [0],                               // Ne - Neon
  11:  [+1, -1],                          // Na - Sodium
  12:  [+2],                              // Mg - Magnesium
  13:  [+3],                              // Al - Aluminium
  14:  [+4, -4, +2, -2, -1, +1, +3],     // Si - Silicon
  15:  [+3, +5, -3, +4, -2, -1, +1, +2], // P  - Phosphorus
  16:  [-2, +4, +6, +2, -1, +1, +3, +5], // S  - Sulfur
  17:  [-1, +1, +3, +5, +7, +4, +2],     // Cl - Chlorine
  18:  [0],                               // Ar - Argon
  19:  [+1, -1],                          // K  - Potassium
  20:  [+2],                              // Ca - Calcium
  21:  [+3, +2, +1],                      // Sc - Scandium
  22:  [+4, +3, +2],                      // Ti - Titanium
  23:  [+5, +4, +3, +2, -1, +1],         // V  - Vanadium
  24:  [+3, +6, +2, +4, +5, -1, +1],     // Cr - Chromium
  25:  [+2, +3, +4, +6, +7, -1],         // Mn - Manganese
  26:  [+3, +2, +4, +6, -2],             // Fe - Iron
  27:  [+2, +3, +4, -1, +1, +5],         // Co - Cobalt
  28:  [+2, +3, +4, -1, +1],             // Ni - Nickel
  29:  [+2, +1, +3, +4],                 // Cu - Copper
  30:  [+2],                              // Zn - Zinc
  31:  [+3, +1, +2],                      // Ga - Gallium
  32:  [+4, +2, -4, +1, +3, -1],         // Ge - Germanium
  33:  [+3, +5, -3, +2, -1, -2],         // As - Arsenic
  34:  [-2, +4, +6, +2, -1, +1],         // Se - Selenium
  35:  [-1, +1, +3, +5, +7, +4],         // Br - Bromine
  36:  [0, +2],                           // Kr - Krypton
  37:  [+1, -1],                          // Rb - Rubidium
  38:  [+2],                              // Sr - Strontium
  39:  [+3, +2, +1],                      // Y  - Yttrium
  40:  [+4, +3, +2, +1],                  // Zr - Zirconium
  41:  [+5, +3, +4, +2, -1, +1],         // Nb - Niobium
  42:  [+6, +4, +5, +3, +2, -1, +1],     // Mo - Molybdenum
  43:  [+7, +4, +3, +5, +6, +2, -1, +1], // Tc - Technetium
  44:  [+3, +4, +2, +5, +6, +8, -2, +1], // Ru - Ruthenium
  45:  [+3, +2, +4, +1, +5, +6, -1],     // Rh - Rhodium
  46:  [+2, +4, +1, +3, +6],             // Pd - Palladium
  47:  [+1, +2, +3],                      // Ag - Silver
  48:  [+2, +1],                          // Cd - Cadmium
  49:  [+3, +1, +2],                      // In - Indium
  50:  [+4, +2, -4, +3, -1],             // Sn - Tin
  51:  [+3, +5, -3, +4, -1, -2],         // Sb - Antimony
  52:  [+4, -2, +6, +2, -1, +1, +3, +5], // Te - Tellurium
  53:  [-1, +5, +7, +1, +3, +4],         // I  - Iodine
  54:  [0, +2, +4, +6, +8],              // Xe - Xenon
  55:  [+1, -1],                          // Cs - Caesium
  56:  [+2],                              // Ba - Barium
  57:  [+3, +2],                          // La - Lanthanum
  58:  [+3, +4, +2],                      // Ce - Cerium
  59:  [+3, +4, +2],                      // Pr - Praseodymium
  60:  [+3, +2, +4],                      // Nd - Neodymium
  61:  [+3, +2],                          // Pm - Promethium
  62:  [+3, +2],                          // Sm - Samarium
  63:  [+3, +2],                          // Eu - Europium
  64:  [+3, +2, +1],                      // Gd - Gadolinium
  65:  [+3, +4, +2, +1],                  // Tb - Terbium
  66:  [+3, +2, +4],                      // Dy - Dysprosium
  67:  [+3, +2],                          // Ho - Holmium
  68:  [+3, +2],                          // Er - Erbium
  69:  [+3, +2],                          // Tm - Thulium
  70:  [+3, +2],                          // Yb - Ytterbium
  71:  [+3, +2],                          // Lu - Lutetium
  72:  [+4, +3, +2],                      // Hf - Hafnium
  73:  [+5, +4, +3, +2, -1, +1],         // Ta - Tantalum
  74:  [+6, +4, +5, +3, +2, -1, +1],     // W  - Tungsten
  75:  [+7, +4, +3, +5, +6, +2, -1, +1], // Re - Rhenium
  76:  [+4, +3, +2, +6, +8, -2, +1],     // Os - Osmium
  77:  [+3, +4, +2, +1, +5, +6, -1],     // Ir - Iridium
  78:  [+2, +4, +1, +3, +5, +6],         // Pt - Platinum
  79:  [+3, +1, +2, +5, -1],             // Au - Gold
  80:  [+2, +1, +4],                      // Hg - Mercury
  81:  [+1, +3, +2],                      // Tl - Thallium
  82:  [+2, +4, -4],                      // Pb - Lead
  83:  [+3, +5, -3, +4, +2],             // Bi - Bismuth
  84:  [+4, +2, -2, +5, +6],             // Po - Polonium
  85:  [-1, +1, +3, +5, +7],             // At - Astatine
  86:  [0, +2, +6],                       // Rn - Radon
  87:  [+1],                              // Fr - Francium
  88:  [+2],                              // Ra - Radium
  89:  [+3, +2],                          // Ac - Actinium
  90:  [+4, +3, +2, +1],                  // Th - Thorium
  91:  [+5, +4, +3, +2],                  // Pa - Protactinium
  92:  [+6, +4, +3, +5, +2],             // U  - Uranium
  93:  [+5, +3, +4, +6, +7, +2],         // Np - Neptunium
  94:  [+4, +3, +5, +6, +2, +7],         // Pu - Plutonium
  95:  [+3, +4, +5, +6, +2, +7],         // Am - Americium
  96:  [+3, +4, +6],                      // Cm - Curium
  97:  [+3, +4],                          // Bk - Berkelium
  98:  [+3, +2, +4],                      // Cf - Californium
  99:  [+3, +2, +4],                      // Es - Einsteinium
  100: [+3, +2],                          // Fm - Fermium
  101: [+3, +2],                          // Md - Mendelevium
  102: [+2, +3],                          // No - Nobelium
  103: [+3],                              // Lr - Lawrencium
  104: [+4, +3],                          // Rf - Rutherfordium (predicted)
  105: [+5, +4, +3],                      // Db - Dubnium (predicted)
  106: [+6, +5, +4, +3],                  // Sg - Seaborgium (predicted)
  107: [+7, +5, +4, +3],                  // Bh - Bohrium (predicted)
  108: [+8, +6, +4, +3],                  // Hs - Hassium (predicted)
  109: [+3, +1, +4, +6],                  // Mt - Meitnerium (predicted)
  110: [+2, +4, +6],                      // Ds - Darmstadtium (predicted)
  111: [+1, +3, +5, -1],                  // Rg - Roentgenium (predicted)
  112: [+2, +1, +4],                      // Cn - Copernicium (predicted)
  113: [+1, +3],                          // Nh - Nihonium (predicted)
  114: [+2, +4],                          // Fl - Flerovium (predicted)
  115: [+1, +3],                          // Mc - Moscovium (predicted)
  116: [+2, +4, -2],                      // Lv - Livermorium (predicted)
  117: [-1, +1, +3, +5],                  // Ts - Tennessine (predicted)
  118: [0, +2, +4, +6],                   // Og - Oganesson (predicted)
};

export default OXIDATION_STATES;
