'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Search,
  MessageSquare,
  MousePointerClick,
  TrendingUp,
  Calendar,
  Mic,
  Zap,
  Briefcase,
  Trophy,
  Lock,
  Menu,
  X,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Footer from './ui/Footer';
import BrandLogo from './ui/BrandLogo';
import styles from './LandingClient.module.css';

const Clock = dynamic(() => import('./ui/Clock'), {
  ssr: false,
  loading: () => <div style={{ height: 100 }} className="clock-placeholder" />,
});

const PhoneMockup = dynamic(() => import('./ui/PhoneMockup'), {
  ssr: false,
  loading: () => (
    <div
      style={{ width: 300, height: 630 }}
      className="phone-mockup-placeholder"
    />
  ),
});

const ThemeToggle = dynamic(() => import('./ui/ThemeToggle'), {
  ssr: false,
  loading: () => (
    <div style={{ width: 44, height: 24 }} className="toggle-placeholder" />
  ),
});

const TESTIMONIALS = [
  {
    name: 'Rahul S.',
    role: 'Student',
    text: 'RemindKaro changed how I manage my hackathons!',
  },
  {
    name: 'Priya M.',
    role: 'Developer',
    text: "Voice entry is magic. Just speak and it's scheduled.",
  },
  {
    name: 'Amit K.',
    role: 'Tech Lead',
    text: 'Clean, fast, exactly what I needed for sprint tracking.',
  },
  {
    name: 'Sneha R.',
    role: 'Designer',
    text: 'The aesthetic is top notch. Love using this app.',
  },
  {
    name: 'Karan V.',
    role: 'Freelancer',
    text: 'Smart escalation ensures I never miss client deadlines.',
  },
];

export default function LandingClient({ isLoggedIn }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [billing, setBilling] = useState('monthly');
  const [ctaHovered, setCtaHovered] = useState(false);
  const { scrollYProgress } = useScroll();
  const bgX1 = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const bgX2 = useTransform(scrollYProgress, [0, 1], ['-10%', '5%']);
  const bgX3 = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);

  // Parallax effects for floating shapes
  const floatY1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const floatY2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const floatY3 = useTransform(scrollYProgress, [0, 1], [0, -400]);

  useEffect(() => {
    document.body.classList.toggle('site-nav-open', mobileNavOpen);
    return () => document.body.classList.remove('site-nav-open');
  }, [mobileNavOpen]);

  const handleCtaClick = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const navItems = [
    { icon: <Search size={20} />, label: 'TRACK' },
    { icon: <MessageSquare size={20} />, label: 'CHAT' },
    { icon: <MousePointerClick size={20} />, label: 'REMIND' },
    { icon: <TrendingUp size={20} />, label: 'SUCCEED' },
  ];

  const features = [
    {
      title: 'Track Deadlines',
      desc: 'Never miss a coding test or assignment. Smart notifications keep you on time.',
      icon: <Calendar size={26} strokeWidth={2} />,
      color: '#6366f1',
    },
    {
      title: 'Voice Entry',
      desc: 'Speak tasks and we categorize and schedule them with zero friction.',
      icon: <Mic size={26} strokeWidth={2} />,
      color: '#0ea5e9',
    },
    {
      title: 'Urgency Escalation',
      desc: 'Highlights what needs attention based on time left and priority.',
      icon: <Zap size={26} strokeWidth={2} />,
      color: '#8b5cf6',
    },
    {
      title: 'Interview Prep',
      desc: 'Interview schedules and prep materials in one organized place.',
      icon: <Briefcase size={26} strokeWidth={2} />,
      color: '#ec4899',
    },
    {
      title: 'Hackathon Tracker',
      desc: 'Team submissions, milestones, and pitch deadlines in one view.',
      icon: <Trophy size={26} strokeWidth={2} />,
      color: '#f97316',
    },
    {
      title: 'Secure & Private',
      desc: 'Encrypted data. We never share or sell your schedule.',
      icon: <Lock size={26} strokeWidth={2} />,
      color: '#22c55e',
    },
  ];

  const plans = [
    {
      id: 'free',
      name: 'Free',
      monthly: 0,
      yearly: 0,
      desc: 'Perfect for students getting started',
      featured: false,
      features: [
        'Up to 25 active tasks',
        'Email deadline reminders',
        'Basic urgency levels',
        'Single timezone',
      ],
      cta: 'Get Started Free',
      href: '/signup',
      secondary: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      monthly: 9,
      yearly: 7,
      desc: 'For power users and freelancers',
      featured: true,
      features: [
        'Unlimited tasks',
        'Voice-powered entry',
        'Smart escalation engine',
        'Priority support',
      ],
      cta: 'Start Pro Trial',
      href: '/signup',
      secondary: false,
    },
    {
      id: 'team',
      name: 'Team',
      monthly: 19,
      yearly: 15,
      desc: 'Hackathon squads & study groups',
      featured: false,
      features: [
        'Everything in Pro',
        'Shared project boards',
        'Team deadline sync',
        'Admin dashboard',
      ],
      cta: 'Contact Sales',
      href: 'mailto:support.india@remindkro.in',
      secondary: true,
    },
  ];

  const scrollTo = (id) => {
    setMobileNavOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className={`landing-page ${styles.page}`}>
        {/* Parallax Floating Shapes */}
        <div className={styles.parallaxContainer} aria-hidden>
          <motion.div
            className={`${styles.parallaxShape} ${styles.shape1}`}
            style={{ y: floatY1 }}
          />
          <motion.div
            className={`${styles.parallaxShape} ${styles.shape2}`}
            style={{ y: floatY2 }}
          />
          <motion.div
            className={`${styles.parallaxShape} ${styles.shape3}`}
            style={{ y: floatY3 }}
          />
        </div>

        <div className={styles.bgTextLayer} aria-hidden>
          <motion.div className={styles.landingBgText} style={{ x: bgX1 }}>
            CODING TESTS INTERVIEWS HACKATHONS
          </motion.div>
          <motion.div className={styles.landingBgText} style={{ x: bgX2 }}>
            ASSIGNMENTS PROJECTS DEADLINES
          </motion.div>
          <motion.div className={styles.landingBgText} style={{ x: bgX3 }}>
            REMIND KARO MANAGE SUCCEED
          </motion.div>
        </div>

        <main className={`main-container ${styles.main}`}>
          <h1 className="sr-only">
            RemindKaro — Smart AI Deadline & Reminders Dashboard
          </h1>
          <header className={`main-header ${styles.header}`}>
            <BrandLogo href="/" size="md" className={styles.logo} />
            <div className={`landing-header-actions ${styles.headerActions}`}>
              <nav className={styles.desktopNav} aria-label="Main">
                <button
                  type="button"
                  className={`navLink ${styles.navLink}`}
                  onClick={() => scrollTo('features')}
                >
                  Features
                </button>
                <button
                  type="button"
                  className={`navLink ${styles.navLink}`}
                  onClick={() => scrollTo('pricing')}
                >
                  Pricing
                </button>
                <Link href="/testimonials" className={styles.navLink}>
                  Testimonials
                </Link>
              </nav>
              <ThemeToggle compact />
              <button
                type="button"
                className={`nav-menu-btn ${styles.menuBtn}`}
                aria-expanded={mobileNavOpen}
                aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileNavOpen((o) => !o)}
              >
                {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link
                href={isLoggedIn ? '/dashboard' : '/signup'}
                className={`${styles.ctaBtn} ${ctaHovered ? styles.ctaBtnHover : ''}`}
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
                onClick={handleCtaClick}
              >
                {isLoggedIn ? 'Dashboard' : 'Get Started'}
              </Link>
            </div>
            <nav
              className={[
                styles.mobileNav,
                mobileNavOpen ? styles.mobileNavOpen : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label="Mobile"
            >
              <button
                type="button"
                className={styles.mobileNavLink}
                onClick={() => scrollTo('features')}
              >
                Features
              </button>
              <button
                type="button"
                className={styles.mobileNavLink}
                onClick={() => scrollTo('pricing')}
              >
                Pricing
              </button>
              <Link
                href="/testimonials"
                className={styles.mobileNavLink}
                onClick={() => setMobileNavOpen(false)}
              >
                Testimonials
              </Link>
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className={styles.mobileNavLink}
                  onClick={() => setMobileNavOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </header>

          <div className={`hero-layout ${styles.hero}`}>
            <div className={`hero-col-left ${styles.heroLeft}`}>
              <div className={`hero-desc ${styles.heroDesc}`}>
                <p>
                  Track coding tests, assignments, and hackathons with smart
                  urgency — built for students and builders.
                </p>
                <div className={`hero-desc-divider ${styles.heroDivider}`} />
              </div>
              <div className="clock-container">
                <Clock />
              </div>
            </div>
            <div className={`hero-col-center ${styles.heroCenter}`}>
              <PhoneMockup />
            </div>
            <div className={`hero-col-right ${styles.heroRight}`}>
              <div className={`nav-list ${styles.navList}`}>
                {navItems.map((item, idx) => (
                  <div
                    key={item.label}
                    className={[
                      styles.navItem,
                      idx === 0 ? styles.navItemActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span style={{ opacity: idx === 0 ? 1 : 0.45 }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.section
            id="features"
            className={`feature-section ${styles.section}`}
          >
            <h2 className={`feature-title ${styles.sectionTitle}`}>
              Simple steps to
              <br />
              deadline success
            </h2>
            <div className={styles.featureGrid}>
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  className={styles.featureCard}
                  style={{ '--feature-color': feature.color }}
                  initial={{ opacity: 0, y: 48 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: idx * 0.08 }}
                >
                  <div className={styles.featureGlow} />
                  <div className={styles.featureIconWrapper}>
                    <div className={styles.featureIcon}>{feature.icon}</div>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            id="pricing"
            className={`pricing-section ${styles.pricingSection}`}
          >
            <p className={styles.pricingEyebrow}>Pricing</p>
            <h2 className={`pricing-title ${styles.sectionTitle}`}>
              Plans that scale with you
            </h2>
            <div className={`pricing-tabs ${styles.pricingTabs}`}>
              <button
                type="button"
                className={[
                  'pricingTab',
                  styles.pricingTab,
                  billing === 'monthly' ? styles.pricingTabActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setBilling('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                className={[
                  'pricingTab',
                  styles.pricingTab,
                  billing === 'yearly' ? styles.pricingTabActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setBilling('yearly')}
              >
                Yearly (save ~20%)
              </button>
            </div>
            <div className={`pricing-grid ${styles.pricingGrid}`}>
              {plans.map((plan) => {
                const price = billing === 'yearly' ? plan.yearly : plan.monthly;
                return (
                  <motion.div
                    key={plan.id}
                    className={[
                      styles.priceCard,
                      plan.featured ? styles.priceCardFeatured : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                  >
                    {plan.featured && (
                      <span className={styles.priceBadge}>Most popular</span>
                    )}
                    <div>
                      <h3 className={styles.priceName}>{plan.name}</h3>
                      <p
                        style={{
                          color: 'var(--landing-ink-subtle)',
                          fontSize: '14px',
                          marginTop: '4px',
                        }}
                      >
                        {plan.desc}
                      </p>
                    </div>
                    <div>
                      <div className={styles.priceAmount}>
                        {price === 0 ? 'Free' : `$${price}`}
                      </div>
                      <div className={styles.pricePeriod}>
                        {price === 0
                          ? 'forever'
                          : billing === 'yearly'
                            ? 'per month, billed yearly'
                            : 'per month'}
                      </div>
                    </div>
                    <ul className={styles.priceFeatures}>
                      {plan.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <Link
                      href={plan.href}
                      className={[
                        styles.priceCta,
                        plan.secondary
                          ? styles.priceCtaSecondary
                          : styles.priceCtaPrimary,
                      ].join(' ')}
                    >
                      {plan.cta}
                      {!plan.secondary && <Check size={16} />}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          <motion.section
            className={`testimonials-section ${styles.section} ${styles.testimonials}`}
          >
            <h2
              className={`testimonials-title ${styles.sectionTitle}`}
              style={{ marginBottom: '32px' }}
            >
              Trusted by the best
            </h2>
            <div className={styles.marqueeTrack}>
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
                <div
                  key={`${t.name}-${idx}`}
                  className={`marquee-card ${styles.marqueeCard}`}
                >
                  <div className={styles.marqueeStars} aria-hidden>
                    ★★★★★
                  </div>
                  <p className={styles.marqueeQuote}&quot;{t.text}&quot;</p>
                  <p className={styles.marqueeName}>{t.name}</p>
                  <p className={styles.marqueeRole}>{t.role}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <section className={`bottom-banner ${styles.bottomBanner}`}>
            <h2 className={`bottom-banner-title ${styles.bottomTitle}`}>
              Ready to take control of your deadlines?
            </h2>
            <p className={`bottom-banner-desc ${styles.bottomDesc}`}>
              Join students and professionals using RemindKaro to stay ahead.
            </p>
            <Link href="/signup" className={styles.bottomCta}>
              Create your free account
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
