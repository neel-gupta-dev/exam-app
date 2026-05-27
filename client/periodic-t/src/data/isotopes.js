// Common isotopes for all elements
// Each entry: { mass: mass number, abundance: '% or half-life', stable: boolean, notable: 'short note (optional)' }
const ISOTOPES = {
  1: [
    { mass: 1, abundance: '99.98%', stable: true, notable: 'Protium' },
    { mass: 2, abundance: '0.02%', stable: true, notable: 'Deuterium' },
    { mass: 3, abundance: 'trace', stable: false, notable: 'Tritium, t½ 12.3y' },
  ],
  2: [
    { mass: 3, abundance: '0.0002%', stable: true, notable: 'Helium-3' },
    { mass: 4, abundance: '99.9998%', stable: true },
  ],
  3: [
    { mass: 6, abundance: '7.59%', stable: true },
    { mass: 7, abundance: '92.41%', stable: true },
  ],
  4: [
    { mass: 7, abundance: 'synthetic', stable: false, notable: 'Used in neutrino detection, t½ 53.2d' },
    { mass: 9, abundance: '100%', stable: true },
    { mass: 10, abundance: 'synthetic', stable: false, notable: 't½ 1.39×10⁶y' },
  ],
  5: [
    { mass: 10, abundance: '19.9%', stable: true, notable: 'Neutron absorber' },
    { mass: 11, abundance: '80.1%', stable: true },
  ],
  6: [
    { mass: 12, abundance: '98.93%', stable: true, notable: 'Basis of atomic mass unit' },
    { mass: 13, abundance: '1.07%', stable: true, notable: 'Used in NMR spectroscopy' },
    { mass: 14, abundance: 'trace', stable: false, notable: 'Radiocarbon dating, t½ 5730y' },
  ],
  7: [
    { mass: 14, abundance: '99.63%', stable: true },
    { mass: 15, abundance: '0.37%', stable: true },
  ],
  8: [
    { mass: 16, abundance: '99.76%', stable: true },
    { mass: 17, abundance: '0.04%', stable: true },
    { mass: 18, abundance: '0.20%', stable: true, notable: 'Used in PET scans (as ¹⁸F precursor)' },
  ],
  9: [
    { mass: 18, abundance: 'synthetic', stable: false, notable: 'PET imaging, t½ 109.8min' },
    { mass: 19, abundance: '100%', stable: true },
  ],
  10: [
    { mass: 20, abundance: '90.48%', stable: true },
    { mass: 21, abundance: '0.27%', stable: true },
    { mass: 22, abundance: '9.25%', stable: true },
  ],
  11: [
    { mass: 22, abundance: 'synthetic', stable: false, notable: 'PET imaging source, t½ 2.6y' },
    { mass: 23, abundance: '100%', stable: true },
    { mass: 24, abundance: 'synthetic', stable: false, notable: 't½ 14.96h' },
  ],
  12: [
    { mass: 24, abundance: '78.99%', stable: true },
    { mass: 25, abundance: '10.00%', stable: true },
    { mass: 26, abundance: '11.01%', stable: true },
  ],
  13: [
    { mass: 26, abundance: 'synthetic', stable: false, notable: 'Extinct radionuclide, t½ 7.17×10⁵y' },
    { mass: 27, abundance: '100%', stable: true },
  ],
  14: [
    { mass: 28, abundance: '92.23%', stable: true },
    { mass: 29, abundance: '4.67%', stable: true },
    { mass: 30, abundance: '3.10%', stable: true },
  ],
  15: [
    { mass: 31, abundance: '100%', stable: true },
    { mass: 32, abundance: 'synthetic', stable: false, notable: 'Radiotracer, t½ 14.3d' },
    { mass: 33, abundance: 'synthetic', stable: false, notable: 't½ 25.3d' },
  ],
  16: [
    { mass: 32, abundance: '94.99%', stable: true },
    { mass: 33, abundance: '0.75%', stable: true },
    { mass: 34, abundance: '4.25%', stable: true },
    { mass: 36, abundance: '0.01%', stable: true },
  ],
  17: [
    { mass: 35, abundance: '75.76%', stable: true },
    { mass: 36, abundance: 'synthetic', stable: false, notable: 'Groundwater dating, t½ 3.01×10⁵y' },
    { mass: 37, abundance: '24.24%', stable: true },
  ],
  18: [
    { mass: 36, abundance: '0.334%', stable: true },
    { mass: 38, abundance: '0.063%', stable: true },
    { mass: 39, abundance: 'trace', stable: false, notable: 'Ice core dating, t½ 269y' },
    { mass: 40, abundance: '99.60%', stable: true },
  ],
  19: [
    { mass: 39, abundance: '93.26%', stable: true },
    { mass: 40, abundance: '0.012%', stable: false, notable: 'K-Ar dating, t½ 1.25×10⁹y' },
    { mass: 41, abundance: '6.73%', stable: true },
  ],
  20: [
    { mass: 40, abundance: '96.94%', stable: true },
    { mass: 42, abundance: '0.647%', stable: true },
    { mass: 44, abundance: '2.09%', stable: true },
    { mass: 48, abundance: '0.187%', stable: true },
  ],
  21: [
    { mass: 45, abundance: '100%', stable: true },
    { mass: 46, abundance: 'synthetic', stable: false, notable: 't½ 83.8d' },
  ],
  22: [
    { mass: 46, abundance: '8.25%', stable: true },
    { mass: 47, abundance: '7.44%', stable: true },
    { mass: 48, abundance: '73.72%', stable: true },
    { mass: 49, abundance: '5.41%', stable: true },
  ],
  23: [
    { mass: 50, abundance: '0.25%', stable: true },
    { mass: 51, abundance: '99.75%', stable: true },
  ],
  24: [
    { mass: 50, abundance: '4.35%', stable: true },
    { mass: 51, abundance: 'synthetic', stable: false, notable: 'Radiotracer, t½ 27.7d' },
    { mass: 52, abundance: '83.79%', stable: true },
    { mass: 53, abundance: '9.50%', stable: true },
  ],
  25: [
    { mass: 55, abundance: '100%', stable: true },
    { mass: 53, abundance: 'synthetic', stable: false, notable: 'Extinct radionuclide, t½ 3.7×10⁶y' },
  ],
  26: [
    { mass: 54, abundance: '5.85%', stable: true },
    { mass: 56, abundance: '91.75%', stable: true },
    { mass: 57, abundance: '2.12%', stable: true },
    { mass: 58, abundance: '0.28%', stable: true },
  ],
  27: [
    { mass: 59, abundance: '100%', stable: true },
    { mass: 60, abundance: 'synthetic', stable: false, notable: 'Radiation therapy, t½ 5.27y' },
  ],
  28: [
    { mass: 58, abundance: '68.08%', stable: true },
    { mass: 60, abundance: '26.22%', stable: true },
    { mass: 62, abundance: '3.63%', stable: true },
    { mass: 63, abundance: 'synthetic', stable: false, notable: 'Medical isotope, t½ 101.2y' },
  ],
  29: [
    { mass: 63, abundance: '69.17%', stable: true },
    { mass: 64, abundance: 'synthetic', stable: false, notable: 'PET imaging, t½ 12.7h' },
    { mass: 65, abundance: '30.83%', stable: true },
  ],
  30: [
    { mass: 64, abundance: '49.17%', stable: true },
    { mass: 66, abundance: '27.73%', stable: true },
    { mass: 67, abundance: '4.04%', stable: true },
    { mass: 68, abundance: '18.45%', stable: true },
  ],
  31: [
    { mass: 69, abundance: '60.11%', stable: true },
    { mass: 71, abundance: '39.89%', stable: true },
    { mass: 67, abundance: 'synthetic', stable: false, notable: 'SPECT imaging, t½ 3.26d' },
  ],
  32: [
    { mass: 70, abundance: '20.52%', stable: true },
    { mass: 72, abundance: '27.45%', stable: true },
    { mass: 73, abundance: '7.76%', stable: true },
    { mass: 74, abundance: '36.52%', stable: true },
  ],
  33: [
    { mass: 75, abundance: '100%', stable: true },
    { mass: 74, abundance: 'synthetic', stable: false, notable: 't½ 17.8d' },
  ],
  34: [
    { mass: 74, abundance: '0.89%', stable: true },
    { mass: 78, abundance: '23.77%', stable: true },
    { mass: 80, abundance: '49.61%', stable: true },
    { mass: 82, abundance: '8.73%', stable: true },
  ],
  35: [
    { mass: 79, abundance: '50.69%', stable: true },
    { mass: 81, abundance: '49.31%', stable: true },
  ],
  36: [
    { mass: 82, abundance: '11.59%', stable: true },
    { mass: 83, abundance: '11.50%', stable: true },
    { mass: 84, abundance: '56.99%', stable: true },
    { mass: 86, abundance: '17.28%', stable: true },
  ],
  37: [
    { mass: 85, abundance: '72.17%', stable: true },
    { mass: 87, abundance: '27.83%', stable: false, notable: 'Rb-Sr dating, t½ 4.9×10¹⁰y' },
  ],
  38: [
    { mass: 84, abundance: '0.56%', stable: true },
    { mass: 86, abundance: '9.86%', stable: true },
    { mass: 87, abundance: '7.00%', stable: true },
    { mass: 88, abundance: '82.58%', stable: true },
  ],
  39: [
    { mass: 89, abundance: '100%', stable: true },
    { mass: 90, abundance: 'synthetic', stable: false, notable: 'Cancer therapy, t½ 64h' },
  ],
  40: [
    { mass: 90, abundance: '51.45%', stable: true },
    { mass: 91, abundance: '11.22%', stable: true },
    { mass: 92, abundance: '17.15%', stable: true },
    { mass: 94, abundance: '17.38%', stable: true },
  ],
  41: [
    { mass: 93, abundance: '100%', stable: true },
    { mass: 94, abundance: 'synthetic', stable: false, notable: 't½ 2.03×10⁴y' },
  ],
  42: [
    { mass: 92, abundance: '14.53%', stable: true },
    { mass: 95, abundance: '15.84%', stable: true },
    { mass: 96, abundance: '16.67%', stable: true },
    { mass: 98, abundance: '24.39%', stable: true },
  ],
  43: [
    { mass: 97, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 4.2×10⁶y' },
    { mass: 98, abundance: 'synthetic', stable: false, notable: 't½ 4.2×10⁶y' },
    { mass: 99, abundance: 'synthetic', stable: false, notable: 'Medical imaging (⁹⁹ᵐTc), t½ 2.1×10⁵y' },
  ],
  44: [
    { mass: 99, abundance: '12.76%', stable: true },
    { mass: 100, abundance: '12.60%', stable: true },
    { mass: 101, abundance: '17.06%', stable: true },
    { mass: 102, abundance: '31.55%', stable: true },
  ],
  45: [
    { mass: 103, abundance: '100%', stable: true },
    { mass: 101, abundance: 'synthetic', stable: false, notable: 't½ 3.3y' },
  ],
  46: [
    { mass: 104, abundance: '11.14%', stable: true },
    { mass: 105, abundance: '22.33%', stable: true },
    { mass: 106, abundance: '27.33%', stable: true },
    { mass: 108, abundance: '26.46%', stable: true },
  ],
  47: [
    { mass: 107, abundance: '51.84%', stable: true },
    { mass: 109, abundance: '48.16%', stable: true },
    { mass: 110, abundance: 'synthetic', stable: false, notable: 'Industrial radiography, t½ 249.8d' },
  ],
  48: [
    { mass: 110, abundance: '12.49%', stable: true },
    { mass: 111, abundance: '12.80%', stable: true },
    { mass: 112, abundance: '24.13%', stable: true },
    { mass: 114, abundance: '28.73%', stable: true },
  ],
  49: [
    { mass: 113, abundance: '4.29%', stable: true },
    { mass: 115, abundance: '95.71%', stable: false, notable: 't½ 4.4×10¹⁴y' },
  ],
  50: [
    { mass: 116, abundance: '14.54%', stable: true },
    { mass: 118, abundance: '24.22%', stable: true },
    { mass: 119, abundance: '8.59%', stable: true, notable: 'Mössbauer spectroscopy' },
    { mass: 120, abundance: '32.58%', stable: true },
  ],
  51: [
    { mass: 121, abundance: '57.21%', stable: true },
    { mass: 123, abundance: '42.79%', stable: true },
  ],
  52: [
    { mass: 126, abundance: '18.84%', stable: true },
    { mass: 128, abundance: '31.74%', stable: true },
    { mass: 130, abundance: '34.08%', stable: true },
  ],
  53: [
    { mass: 127, abundance: '100%', stable: true },
    { mass: 129, abundance: 'trace', stable: false, notable: 'Xenon dating, t½ 1.57×10⁷y' },
    { mass: 131, abundance: 'synthetic', stable: false, notable: 'Thyroid therapy, t½ 8.02d' },
  ],
  54: [
    { mass: 129, abundance: '26.44%', stable: true },
    { mass: 131, abundance: '21.18%', stable: true },
    { mass: 132, abundance: '26.89%', stable: true },
    { mass: 134, abundance: '10.44%', stable: true },
  ],
  55: [
    { mass: 133, abundance: '100%', stable: true },
    { mass: 134, abundance: 'synthetic', stable: false, notable: 'Fission product, t½ 2.07y' },
    { mass: 137, abundance: 'synthetic', stable: false, notable: 'Fission product, t½ 30.2y' },
  ],
  56: [
    { mass: 134, abundance: '2.42%', stable: true },
    { mass: 136, abundance: '7.85%', stable: true },
    { mass: 137, abundance: '11.23%', stable: true },
    { mass: 138, abundance: '71.70%', stable: true },
  ],
  57: [
    { mass: 138, abundance: '0.089%', stable: true },
    { mass: 139, abundance: '99.91%', stable: true },
  ],
  58: [
    { mass: 136, abundance: '0.19%', stable: true },
    { mass: 138, abundance: '0.25%', stable: true },
    { mass: 140, abundance: '88.45%', stable: true },
    { mass: 142, abundance: '11.11%', stable: true },
  ],
  59: [
    { mass: 141, abundance: '100%', stable: true },
    { mass: 143, abundance: 'synthetic', stable: false, notable: 't½ 13.6d' },
  ],
  60: [
    { mass: 142, abundance: '27.15%', stable: true },
    { mass: 143, abundance: '12.17%', stable: true, notable: 'Sm-Nd dating' },
    { mass: 144, abundance: '23.80%', stable: true },
    { mass: 146, abundance: '17.18%', stable: true },
  ],
  61: [
    { mass: 145, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 17.7y' },
    { mass: 146, abundance: 'synthetic', stable: false, notable: 't½ 5.53y' },
    { mass: 147, abundance: 'synthetic', stable: false, notable: 'Nuclear battery, t½ 2.62y' },
  ],
  62: [
    { mass: 147, abundance: '14.99%', stable: false, notable: 'Sm-Nd dating, t½ 1.06×10¹¹y' },
    { mass: 149, abundance: '13.82%', stable: true, notable: 'Highest neutron cross-section' },
    { mass: 150, abundance: '7.38%', stable: true },
    { mass: 152, abundance: '26.75%', stable: true },
  ],
  63: [
    { mass: 151, abundance: '47.81%', stable: true },
    { mass: 153, abundance: '52.19%', stable: true },
  ],
  64: [
    { mass: 155, abundance: '14.80%', stable: true },
    { mass: 156, abundance: '20.47%', stable: true },
    { mass: 157, abundance: '15.65%', stable: true, notable: 'Highest thermal neutron capture' },
    { mass: 158, abundance: '24.84%', stable: true },
  ],
  65: [
    { mass: 159, abundance: '100%', stable: true },
    { mass: 160, abundance: 'synthetic', stable: false, notable: 't½ 72.3d' },
  ],
  66: [
    { mass: 161, abundance: '18.89%', stable: true },
    { mass: 162, abundance: '25.48%', stable: true },
    { mass: 163, abundance: '24.90%', stable: true },
    { mass: 164, abundance: '28.26%', stable: true },
  ],
  67: [
    { mass: 165, abundance: '100%', stable: true },
    { mass: 166, abundance: 'synthetic', stable: false, notable: 'Liver cancer treatment, t½ 26.8h' },
  ],
  68: [
    { mass: 164, abundance: '1.60%', stable: true },
    { mass: 166, abundance: '33.50%', stable: true },
    { mass: 167, abundance: '22.87%', stable: true },
    { mass: 168, abundance: '26.98%', stable: true },
  ],
  69: [
    { mass: 169, abundance: '100%', stable: true },
    { mass: 170, abundance: 'synthetic', stable: false, notable: 'Portable X-ray source, t½ 128.6d' },
    { mass: 171, abundance: 'synthetic', stable: false, notable: 't½ 1.92y' },
  ],
  70: [
    { mass: 171, abundance: '14.09%', stable: true },
    { mass: 172, abundance: '21.68%', stable: true },
    { mass: 173, abundance: '16.10%', stable: true },
    { mass: 174, abundance: '32.03%', stable: true },
  ],
  71: [
    { mass: 175, abundance: '97.40%', stable: true },
    { mass: 176, abundance: '2.60%', stable: false, notable: 'Lu-Hf dating, t½ 3.76×10¹⁰y' },
  ],
  72: [
    { mass: 177, abundance: '18.60%', stable: true },
    { mass: 178, abundance: '27.28%', stable: true },
    { mass: 179, abundance: '13.62%', stable: true },
    { mass: 180, abundance: '35.08%', stable: true },
  ],
  73: [
    { mass: 180, abundance: '0.012%', stable: false, notable: 't½ >1.2×10¹⁵y' },
    { mass: 181, abundance: '99.99%', stable: true },
  ],
  74: [
    { mass: 182, abundance: '26.50%', stable: true },
    { mass: 183, abundance: '14.31%', stable: true },
    { mass: 184, abundance: '30.64%', stable: true },
    { mass: 186, abundance: '28.43%', stable: true },
  ],
  75: [
    { mass: 185, abundance: '37.40%', stable: true },
    { mass: 187, abundance: '62.60%', stable: false, notable: 'Re-Os dating, t½ 4.12×10¹⁰y' },
  ],
  76: [
    { mass: 188, abundance: '13.24%', stable: true },
    { mass: 189, abundance: '16.15%', stable: true },
    { mass: 190, abundance: '26.26%', stable: true },
    { mass: 192, abundance: '40.93%', stable: true },
  ],
  77: [
    { mass: 191, abundance: '37.3%', stable: true },
    { mass: 192, abundance: 'synthetic', stable: false, notable: 'Industrial radiography, t½ 73.8d' },
    { mass: 193, abundance: '62.7%', stable: true },
  ],
  78: [
    { mass: 194, abundance: '32.86%', stable: true },
    { mass: 195, abundance: '33.78%', stable: true, notable: 'NMR active' },
    { mass: 196, abundance: '25.21%', stable: true },
    { mass: 198, abundance: '7.36%', stable: true },
  ],
  79: [
    { mass: 197, abundance: '100%', stable: true },
    { mass: 198, abundance: 'synthetic', stable: false, notable: 'Cancer treatment, t½ 2.69d' },
  ],
  80: [
    { mass: 198, abundance: '9.97%', stable: true },
    { mass: 199, abundance: '16.87%', stable: true },
    { mass: 200, abundance: '23.10%', stable: true },
    { mass: 202, abundance: '29.86%', stable: true },
  ],
  81: [
    { mass: 203, abundance: '29.52%', stable: true },
    { mass: 205, abundance: '70.48%', stable: true },
    { mass: 201, abundance: 'synthetic', stable: false, notable: 'Cardiac imaging, t½ 3.04d' },
  ],
  82: [
    { mass: 206, abundance: '24.1%', stable: true, notable: 'U-238 decay product' },
    { mass: 207, abundance: '22.1%', stable: true, notable: 'U-235 decay product' },
    { mass: 208, abundance: '52.4%', stable: true, notable: 'Heaviest stable nuclide' },
    { mass: 210, abundance: 'trace', stable: false, notable: 't½ 22.2y' },
  ],
  83: [
    { mass: 209, abundance: '100%', stable: false, notable: 'Nearly stable, t½ 2.01×10¹⁹y' },
    { mass: 210, abundance: 'trace', stable: false, notable: 't½ 5.01d' },
  ],
  84: [
    { mass: 208, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 2.90y' },
    { mass: 209, abundance: 'synthetic', stable: false, notable: 't½ 124y' },
    { mass: 210, abundance: 'trace', stable: false, notable: 'Poisoned Litvinenko, t½ 138.4d' },
  ],
  85: [
    { mass: 210, abundance: 'trace', stable: false, notable: 't½ 8.1h' },
    { mass: 211, abundance: 'trace', stable: false, notable: 'Cancer therapy research, t½ 7.2h' },
  ],
  86: [
    { mass: 220, abundance: 'trace', stable: false, notable: 'Thoron, t½ 55.6s' },
    { mass: 222, abundance: 'trace', stable: false, notable: 'Indoor radiation hazard, t½ 3.82d' },
  ],
  87: [
    { mass: 221, abundance: 'trace', stable: false, notable: 't½ 4.8min' },
    { mass: 223, abundance: 'trace', stable: false, notable: 'Longest-lived, t½ 22.0min' },
  ],
  88: [
    { mass: 223, abundance: 'trace', stable: false, notable: 't½ 11.4d' },
    { mass: 224, abundance: 'trace', stable: false, notable: 't½ 3.63d' },
    { mass: 226, abundance: 'trace', stable: false, notable: 'Discovered by Curie, t½ 1600y' },
    { mass: 228, abundance: 'trace', stable: false, notable: 't½ 5.75y' },
  ],
  89: [
    { mass: 225, abundance: 'synthetic', stable: false, notable: 'Cancer therapy research, t½ 10.0d' },
    { mass: 227, abundance: 'trace', stable: false, notable: 'Longest-lived, t½ 21.8y' },
  ],
  90: [
    { mass: 229, abundance: 'trace', stable: false, notable: 'Nuclear clock candidate, t½ 7880y' },
    { mass: 230, abundance: 'trace', stable: false, notable: 't½ 7.54×10⁴y' },
    { mass: 232, abundance: '100%', stable: false, notable: 'Fertile material, t½ 1.40×10¹⁰y' },
  ],
  91: [
    { mass: 231, abundance: 'trace', stable: false, notable: 'Longest-lived, t½ 3.28×10⁴y' },
    { mass: 233, abundance: 'synthetic', stable: false, notable: 't½ 27.0d' },
  ],
  92: [
    { mass: 234, abundance: '0.005%', stable: false, notable: 't½ 2.46×10⁵y' },
    { mass: 235, abundance: '0.72%', stable: false, notable: 'Nuclear fission fuel, t½ 7.04×10⁸y' },
    { mass: 238, abundance: '99.27%', stable: false, notable: 'Most common, t½ 4.47×10⁹y' },
  ],
  93: [
    { mass: 236, abundance: 'trace', stable: false, notable: 't½ 1.54×10⁵y' },
    { mass: 237, abundance: 'trace', stable: false, notable: 'Longest-lived, t½ 2.14×10⁶y' },
    { mass: 239, abundance: 'synthetic', stable: false, notable: 't½ 2.36d' },
  ],
  94: [
    { mass: 238, abundance: 'synthetic', stable: false, notable: 'RTG power source, t½ 87.7y' },
    { mass: 239, abundance: 'trace', stable: false, notable: 'Nuclear weapon/fuel, t½ 2.41×10⁴y' },
    { mass: 244, abundance: 'trace', stable: false, notable: 'Longest-lived, t½ 8.0×10⁷y' },
  ],
  95: [
    { mass: 241, abundance: 'synthetic', stable: false, notable: 'Smoke detectors, t½ 432.2y' },
    { mass: 243, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 7370y' },
  ],
  96: [
    { mass: 244, abundance: 'synthetic', stable: false, notable: 't½ 18.1y' },
    { mass: 247, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 1.56×10⁷y' },
    { mass: 248, abundance: 'synthetic', stable: false, notable: 't½ 3.48×10⁵y' },
  ],
  97: [
    { mass: 247, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 1380y' },
    { mass: 249, abundance: 'synthetic', stable: false, notable: 't½ 330d' },
  ],
  98: [
    { mass: 249, abundance: 'synthetic', stable: false, notable: 't½ 351y' },
    { mass: 251, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 900y' },
    { mass: 252, abundance: 'synthetic', stable: false, notable: 'Neutron source, t½ 2.65y' },
  ],
  99: [
    { mass: 252, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 471.7d' },
    { mass: 253, abundance: 'synthetic', stable: false, notable: 't½ 20.5d' },
    { mass: 254, abundance: 'synthetic', stable: false, notable: 't½ 275.7d' },
  ],
  100: [
    { mass: 255, abundance: 'synthetic', stable: false, notable: 't½ 20.1h' },
    { mass: 257, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 100.5d' },
  ],
  101: [
    { mass: 258, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 51.5d' },
    { mass: 260, abundance: 'synthetic', stable: false, notable: 't½ 27.8d' },
  ],
  102: [
    { mass: 255, abundance: 'synthetic', stable: false, notable: 't½ 3.1min' },
    { mass: 259, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 58min' },
  ],
  103: [
    { mass: 262, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ 3.6h' },
    { mass: 266, abundance: 'synthetic', stable: false, notable: 't½ ~11h' },
  ],
  104: [
    { mass: 261, abundance: 'synthetic', stable: false, notable: 't½ 78s' },
    { mass: 267, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~1.3h' },
  ],
  105: [
    { mass: 262, abundance: 'synthetic', stable: false, notable: 't½ 34s' },
    { mass: 268, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~16h' },
  ],
  106: [
    { mass: 269, abundance: 'synthetic', stable: false, notable: 't½ ~3.1min' },
    { mass: 271, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~1.9min' },
  ],
  107: [
    { mass: 270, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~2.4min' },
    { mass: 267, abundance: 'synthetic', stable: false, notable: 't½ ~17s' },
  ],
  108: [
    { mass: 269, abundance: 'synthetic', stable: false, notable: 't½ ~16s' },
    { mass: 277, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~45s' },
  ],
  109: [
    { mass: 276, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~7.2s' },
    { mass: 278, abundance: 'synthetic', stable: false, notable: 't½ ~4.5s' },
  ],
  110: [
    { mass: 281, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~12.7s' },
    { mass: 279, abundance: 'synthetic', stable: false, notable: 't½ ~0.20s' },
  ],
  111: [
    { mass: 282, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~0.7min' },
    { mass: 280, abundance: 'synthetic', stable: false, notable: 't½ ~3.6s' },
  ],
  112: [
    { mass: 285, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~28s' },
    { mass: 283, abundance: 'synthetic', stable: false, notable: 't½ ~4s' },
  ],
  113: [
    { mass: 286, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~8s' },
    { mass: 284, abundance: 'synthetic', stable: false, notable: 't½ ~0.48s' },
  ],
  114: [
    { mass: 289, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~2.6s' },
    { mass: 290, abundance: 'synthetic', stable: false, notable: 't½ ~19ms' },
  ],
  115: [
    { mass: 289, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~220ms' },
    { mass: 290, abundance: 'synthetic', stable: false, notable: 't½ ~16ms' },
  ],
  116: [
    { mass: 293, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~53ms' },
    { mass: 292, abundance: 'synthetic', stable: false, notable: 't½ ~18ms' },
  ],
  117: [
    { mass: 294, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~51ms' },
    { mass: 293, abundance: 'synthetic', stable: false, notable: 't½ ~22ms' },
  ],
  118: [
    { mass: 294, abundance: 'synthetic', stable: false, notable: 'Longest-lived, t½ ~0.7ms' },
    { mass: 295, abundance: 'synthetic', stable: false, notable: 'Predicted, t½ ~181ms' },
  ],
};

export default ISOTOPES;
