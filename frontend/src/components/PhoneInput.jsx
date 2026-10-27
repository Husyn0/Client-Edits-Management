import { useMemo } from 'react';

const DEFAULT_COUNTRY_CODE = '+1';

const COUNTRY_CODES = [
  { value: '+1', label: '+1 (US)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+61', label: '+61 (AU)' },
  { value: '+91', label: '+91 (IN)' },
  { value: '+33', label: '+33 (FR)' },
  { value: '+49', label: '+49 (DE)' },
  { value: '+52', label: '+52 (MX)' },
  { value: '+55', label: '+55 (BR)' },
  { value: '+27', label: '+27 (ZA)' },
  { value: '+966', label: '+966 (SA)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+81', label: '+81 (JP)' },
  { value: '+82', label: '+82 (KR)' },
  { value: '+86', label: '+86 (CN)' },
  { value: '+34', label: '+34 (ES)' },
  { value: '+39', label: '+39 (IT)' },
  { value: '+31', label: '+31 (NL)' },
  { value: '+46', label: '+46 (SE)' },
  { value: '+47', label: '+47 (NO)' },
  { value: '+48', label: '+48 (PL)' },
  { value: '+41', label: '+41 (CH)' },
  { value: '+43', label: '+43 (AT)' },
  { value: '+351', label: '+351 (PT)' },
  { value: '+358', label: '+358 (FI)' },
  { value: '+420', label: '+420 (CZ)' },
  { value: '+386', label: '+386 (SI)' },
  { value: '+421', label: '+421 (SK)' },
  { value: '+359', label: '+359 (BG)' },
  { value: '+370', label: '+370 (LT)' },
  { value: '+371', label: '+371 (LV)' },
  { value: '+372', label: '+372 (EE)' },
  { value: '+373', label: '+373 (MD)' },
  { value: '+374', label: '+374 (AM)' },
  { value: '+375', label: '+375 (BY)' },
  { value: '+376', label: '+376 (AD)' },
  { value: '+377', label: '+377 (MC)' },
  { value: '+378', label: '+378 (SM)' },
  { value: '+379', label: '+379 (VA)' },
  { value: '+380', label: '+380 (UA)' },
  { value: '+381', label: '+381 (RS)' },
  { value: '+382', label: '+382 (ME)' },
  { value: '+383', label: '+383 (XK)' },
  { value: '+385', label: '+385 (HR)' },
  { value: '+386', label: '+386 (SI)' },
  { value: '+387', label: '+387 (BA)' },
  { value: '+389', label: '+389 (MK)' },
  { value: '+420', label: '+420 (CZ)' },
  { value: '+421', label: '+421 (SK)' },
  { value: '+423', label: '+423 (LI)' },
  { value: '+500', label: '+500 (FK)' },
  { value: '+501', label: '+501 (BZ)' },
  { value: '+502', label: '+502 (GT)' },
  { value: '+503', label: '+503 (SV)' },
  { value: '+504', label: '+504 (HN)' },
  { value: '+505', label: '+505 (NI)' },
  { value: '+506', label: '+506 (CR)' },
  { value: '+507', label: '+507 (PA)' },
  { value: '+508', label: '+508 (PM)' },
  { value: '+509', label: '+509 (HT)' },
  { value: '+590', label: '+590 (GP)' },
  { value: '+591', label: '+591 (BO)' },
  { value: '+592', label: '+592 (GY)' },
  { value: '+593', label: '+593 (EC)' },
  { value: '+594', label: '+594 (GF)' },
  { value: '+595', label: '+595 (PY)' },
  { value: '+596', label: '+596 (MQ)' },
  { value: '+597', label: '+597 (SR)' },
  { value: '+598', label: '+598 (UY)' },
  { value: '+599', label: '+599 (CW)' },
  { value: '+670', label: '+670 (TL)' },
  { value: '+672', label: '+672 (NF)' },
  { value: '+673', label: '+673 (BN)' },
  { value: '+674', label: '+674 (NR)' },
  { value: '+675', label: '+675 (PG)' },
  { value: '+676', label: '+676 (TO)' },
  { value: '+677', label: '+677 (SB)' },
  { value: '+678', label: '+678 (VU)' },
  { value: '+679', label: '+679 (FJ)' },
  { value: '+680', label: '+680 (PW)' },
  { value: '+681', label: '+681 (WF)' },
  { value: '+682', label: '+682 (CK)' },
  { value: '+683', label: '+683 (NU)' },
  { value: '+685', label: '+685 (WS)' },
  { value: '+686', label: '+686 (KI)' },
  { value: '+687', label: '+687 (NC)' },
  { value: '+688', label: '+688 (TV)' },
  { value: '+689', label: '+689 (PF)' },
  { value: '+690', label: '+690 (TK)' },
  { value: '+691', label: '+691 (FM)' },
  { value: '+692', label: '+692 (MH)' },
  { value: '+850', label: '+850 (KP)' },
  { value: '+852', label: '+852 (HK)' },
  { value: '+853', label: '+853 (MO)' },
  { value: '+855', label: '+855 (KH)' },
  { value: '+856', label: '+856 (LA)' },
  { value: '+880', label: '+880 (BD)' },
  { value: '+886', label: '+886 (TW)' },
  { value: '+960', label: '+960 (MV)' },
  { value: '+961', label: '+961 (LB)' },
  { value: '+962', label: '+962 (JO)' },
  { value: '+963', label: '+963 (SY)' },
  { value: '+964', label: '+964 (IQ)' },
  { value: '+965', label: '+965 (KW)' },
  { value: '+966', label: '+966 (SA)' },
  { value: '+967', label: '+967 (YE)' },
  { value: '+968', label: '+968 (OM)' },
  { value: '+970', label: '+970 (PS)' },
  { value: '+971', label: '+971 (AE)' },
  { value: '+972', label: '+972 (IL)' },
  { value: '+973', label: '+973 (BH)' },
  { value: '+974', label: '+974 (QA)' },
  { value: '+975', label: '+975 (BT)' },
  { value: '+976', label: '+976 (MN)' },
  { value: '+977', label: '+977 (NP)' },
  { value: '+992', label: '+992 (TJ)' },
  { value: '+993', label: '+993 (TM)' },
  { value: '+994', label: '+994 (AZ)' },
  { value: '+995', label: '+995 (GE)' },
  { value: '+996', label: '+996 (KG)' },
  { value: '+998', label: '+998 (UZ)' },
];

export default function PhoneInput({ value = '', onChange, required = false }) {
  const { code, number } = useMemo(() => {
    const raw = String(value || '').trim();
    const match = raw.match(/^(\+\d+)\s*(\d*)$/);

    if (match) {
      return {
        code: match[1] || DEFAULT_COUNTRY_CODE,
        number: match[2] || '',
      };
    }

    const digits = raw.replace(/\D/g, '');
    return {
      code: DEFAULT_COUNTRY_CODE,
      number: digits,
    };
  }, [value]);

  const updateNumber = (nextNumber) => {
    const digitsOnly = nextNumber.replace(/\D/g, '');
    onChange(`${code} ${digitsOnly}`.trim());
  };

  const updateCode = (nextCode) => {
    onChange(`${nextCode} ${number}`.trim());
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select
        className="input"
        value={code}
        onChange={(e) => updateCode(e.target.value)}
        style={{ maxWidth: 150 }}
      >
        {COUNTRY_CODES.map((country) => (
          <option key={country.value} value={country.value}>
            {country.label}
          </option>
        ))}
      </select>

      <input
        type="tel"
        className="input"
        inputMode="numeric"
        pattern="[0-9]*"
        value={number}
        onChange={(e) => updateNumber(e.target.value)}
        placeholder="Phone number"
        required={required}
        style={{ flex: 1 }}
      />
    </div>
  );
}
