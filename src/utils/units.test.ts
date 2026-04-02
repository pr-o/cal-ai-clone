import { cmToFtIn, ftInToCm, kgToLbs, lbsToKg, mlToOz, ozToMl } from './units';

describe('weight conversions', () => {
  it('kgToLbs converts correctly', () => {
    expect(kgToLbs(80)).toBeCloseTo(176.4, 0);
  });

  it('lbsToKg is the inverse of kgToLbs', () => {
    expect(lbsToKg(kgToLbs(80))).toBeCloseTo(80, 0);
  });

  it('kgToLbs(0) = 0', () => {
    expect(kgToLbs(0)).toBe(0);
  });
});

describe('height conversions', () => {
  it('cmToFtIn converts 180cm to ~5\'11"', () => {
    const result = cmToFtIn(180);
    expect(result.ft).toBe(5);
    expect(result.in).toBe(11);
  });

  it('ftInToCm is the inverse of cmToFtIn', () => {
    const { ft, in: inches } = cmToFtIn(175);
    expect(ftInToCm(ft, inches)).toBeCloseTo(175, 0);
  });
});

describe('volume conversions', () => {
  it('mlToOz converts 500ml to ~16.9oz', () => {
    expect(mlToOz(500)).toBeCloseTo(16.9, 0);
  });

  it('ozToMl is the inverse of mlToOz', () => {
    expect(ozToMl(mlToOz(500))).toBeCloseTo(500, 0);
  });
});
