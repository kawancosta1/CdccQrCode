interface UniversalAccessibilityIconProps {
  size?: number;
  className?: string;
}

/**
 * Símbolo Universal de Acessibilidade (ONU): figura humana simétrica de braços abertos
 * dentro de um círculo, representando inclusão digital, visual, auditiva, cognitiva e motora.
 */
export function UniversalAccessibilityIcon({
  size = 18,
  className,
}: UniversalAccessibilityIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="7.5" r="1.25" fill="currentColor" stroke="none" />
      <path d="M7 10.5c1.8.6 3.4.9 5 .9s3.2-.3 5-.9" />
      <path d="M12 11.4v4.2" />
      <path d="M12 15.6 9.4 19" />
      <path d="M12 15.6 14.6 19" />
    </svg>
  );
}
