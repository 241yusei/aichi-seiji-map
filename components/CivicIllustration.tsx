/** Abstract civic illustration: the same three shapes represent equal access to records. */
export function CivicIllustration() {
  return (
    <svg className="hero-art" viewBox="0 0 460 440" fill="none" aria-hidden="true">
      <circle cx="235" cy="220" r="197" fill="#FFF5F2" />
      <circle cx="235" cy="220" r="157" stroke="#EACDC5" strokeDasharray="3 8" />
      <path d="M68 134C94 61 172 27 242 36M384 316C360 368 309 402 253 405" stroke="#F73B20" strokeWidth="2" strokeLinecap="round" />
      <circle cx="246" cy="36" r="5" fill="#F73B20" />
      <circle cx="249" cy="405" r="5" fill="#F73B20" />
      <g transform="rotate(-9 227 231)">
        <rect x="114" y="90" width="226" height="286" rx="20" fill="#F73B20" />
        <path d="M134 91V375" stroke="#C3311B" strokeWidth="2" />
        <path d="M302 90V136L288 128L274 136V90" fill="#F5FFBB" />
        <text x="158" y="146" fill="#360802" fontSize="11" letterSpacing="2">AICHI / NAGOYA</text>
        <text x="157" y="210" fill="#360802" fontSize="38" fontWeight="500">政治の</text>
        <text x="157" y="259" fill="#360802" fontSize="38" fontWeight="500">トリセツ</text>
        <path d="M159 300H290" stroke="#360802" strokeOpacity=".3" />
        <text x="158" y="331" fill="#360802" fontSize="12">知ることから、はじめよう。</text>
      </g>
      <g transform="rotate(6 343 119)">
        <rect x="303" y="64" width="108" height="101" rx="16" fill="white" stroke="#E7DCDB" />
        <path d="M340 94L358 84L376 94M342 99V117M352 99V117M363 99V117M373 99V117M338 121H378" stroke="#360802" strokeWidth="2" strokeLinecap="round" />
        <text x="358" y="147" fill="#360802" fontSize="13" textAnchor="middle">国のこと</text>
      </g>
      <g transform="rotate(-5 71 230)">
        <rect x="17" y="180" width="108" height="101" rx="16" fill="white" stroke="#E7DCDB" />
        <path d="M53 235V208H73V235M73 219H87V235M49 236H91M59 215H65M59 223H65M79 227H81" stroke="#360802" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="71" y="263" fill="#360802" fontSize="13" textAnchor="middle">県のこと</text>
      </g>
      <g transform="rotate(7 365 322)">
        <rect x="306" y="274" width="108" height="101" rx="16" fill="white" stroke="#E7DCDB" />
        <path d="M342 315L360 299L378 315M346 313V336H374V313M356 336V324H364V336" stroke="#360802" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="360" y="359" fill="#360802" fontSize="13" textAnchor="middle">まちのこと</text>
      </g>
      <circle cx="104" cy="363" r="22" fill="#F5FFBB" />
      <path d="M95 363L101 369L113 356" stroke="#360802" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M382 220H399M390.5 211.5V228.5" stroke="#F73B20" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
