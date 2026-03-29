export default function RoseIcon() {
  return (
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      {/* Stem */}
      <path d="M24 38 Q22 32 24 26" />
      {/* Leaf */}
      <path d="M24 32 Q18 30 17 24 Q22 24 24 32" />
      {/* Outer petals */}
      <path d="M24 10 C18 10 14 15 14 20 C14 26 18 29 24 30 C30 29 34 26 34 20 C34 15 30 10 24 10Z" />
      {/* Inner petal curl */}
      <path d="M24 14 C21 14 19 17 19 20 C19 23 21 25 24 26 C27 25 29 23 29 20 C29 17 27 14 24 14Z" />
      {/* Top opening */}
      <path d="M20 13 C20 10 22 8 24 8 C26 8 28 10 28 13" />
    </svg>
  );
}
