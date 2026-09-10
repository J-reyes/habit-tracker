import styles from "./Header.module.css";

const BLOCKS = [
  { left: "7%", bottom: "10%", w: 72, h: 36, delay: "0s", duration: "9s", tone: "cyan" },
  { left: "12%", bottom: "22%", w: 44, h: 44, delay: "0.35s", duration: "10s", tone: "violet" },
  { left: "20%", bottom: "8%", w: 56, h: 56, delay: "0.15s", duration: "8.5s", tone: "ice" },
  { left: "28%", bottom: "24%", w: 36, h: 28, delay: "0.6s", duration: "11s", tone: "cyan" },
  { left: "8%", bottom: "38%", w: 32, h: 32, delay: "0.9s", duration: "12s", tone: "violet" },
  { left: "66%", bottom: "9%", w: 64, h: 40, delay: "0.2s", duration: "9.5s", tone: "violet" },
  { left: "74%", bottom: "23%", w: 48, h: 48, delay: "0.45s", duration: "10.5s", tone: "ice" },
  { left: "82%", bottom: "8%", w: 52, h: 32, delay: "0.1s", duration: "8s", tone: "cyan" },
  { left: "88%", bottom: "22%", w: 36, h: 36, delay: "0.7s", duration: "11.5s", tone: "violet" },
  { left: "78%", bottom: "40%", w: 28, h: 28, delay: "1s", duration: "12.5s", tone: "ice" },
] as const;

function Header() {
  return (
    <header className={styles.hero}>
      <div className={styles.blocks} aria-hidden="true">
        {BLOCKS.map((block, index) => (
          <span
            key={index}
            className={`${styles.block} ${styles[block.tone]}`}
            style={{
              left: block.left,
              bottom: block.bottom,
              width: block.w,
              height: block.h,
              animationDelay: block.delay,
              animationDuration: block.duration,
            }}
          />
        ))}
      </div>
      <h1 className={styles.title}>Track your habits</h1>
      <p className={styles.subtitle}>
        Small things, done daily. Keep the streak alive
      </p>
    </header>
  );
}

export default Header;
