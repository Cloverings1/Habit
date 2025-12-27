import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

type NavItem = { label: string; to: string };
export type TocItem = { id: string; label: string };

interface StaticPageShellProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  toc?: TocItem[];
  children: ReactNode;
}

const DEFAULT_NAV: NavItem[] = [
  { label: 'Status', to: '/status' },
  { label: 'Release Notes', to: '/release-notes' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

export const StaticPageShell = ({
  kicker,
  title,
  subtitle,
  meta,
  toc,
  children,
}: StaticPageShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 40,
    mass: 0.3,
  });

  const navItems = useMemo(
    () => DEFAULT_NAV.map((n) => ({ ...n, active: location.pathname === n.to })),
    [location.pathname]
  );

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleTocClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className="static-page selection:bg-[rgba(232,93,79,0.25)]">
      <a className="static-skip-link" href="#content">
        Skip to content
      </a>

      <div className="static-bg" aria-hidden="true" />

      {/* Scroll progress */}
      <motion.div
        className="static-progress"
        style={{ scaleX: progress }}
        initial={false}
        aria-hidden="true"
      />

      {/* Top nav */}
      <header className="static-nav">
        <div className="static-nav-inner">
          <button
            onClick={() => navigate('/')}
            className="static-brand"
            aria-label="Go to Habits home"
          >
            Habits
          </button>

          <nav className="static-nav-links" aria-label="Site">
            {navItems.map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`static-nav-pill ${item.active ? 'active' : ''}`}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button onClick={goBack} className="static-back">
            Back
          </button>
        </div>
      </header>

      <main className="static-main" id="content">
        <motion.section
          className="static-hero"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {kicker && <p className="static-kicker">{kicker}</p>}
          <h1 className="static-title">{title}</h1>
          {(subtitle || meta) && (
            <div className="static-subhead">
              {subtitle && <p className="static-subtitle">{subtitle}</p>}
              {meta && <p className="static-meta">{meta}</p>}
            </div>
          )}
        </motion.section>

        <div className={`static-grid ${toc?.length ? 'has-toc' : ''}`}>
          <div className="static-content">{children}</div>

          {toc?.length ? (
            <aside className="static-toc" aria-label="On this page">
              <div className="static-toc-inner">
                <p className="static-toc-title">On this page</p>
                <div className="static-toc-links">
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      className="static-toc-link"
                      onClick={() => handleTocClick(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          ) : null}
        </div>

        <footer className="static-footer">
          <div className="static-footer-inner">
            <p className="static-footer-note">Quietly building since 2025.</p>
            <div className="static-footer-links">
              {navItems.map((item) => (
                <button
                  key={`footer-${item.to}`}
                  onClick={() => navigate(item.to)}
                  className="static-footer-link"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

interface StaticSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  hint?: string;
  variant?: 'card' | 'clean';
}

export const StaticSection = ({ id, title, hint, children, variant = 'card' }: StaticSectionProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={`static-section ${variant === 'clean' ? 'clean' : ''}`}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="static-section-head">
        <h2 className="static-section-title">{title}</h2>
        {hint && <p className="static-section-hint">{hint}</p>}
      </div>
      <div className={variant === 'card' ? 'static-card' : 'static-content-clean'}>
        {children}
      </div>
    </motion.section>
  );
};
