export default function Logo({ size = 80 }) {
  return (
    <img
      src="/logo.png"
      alt=""
      height={size}
      style={{ width: 'auto', height: size, marginTop: '20px' }}
    />
  );
}