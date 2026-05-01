import { motion } from 'framer-motion';

export function HelpPage() {
  const faqs = [
    { q: "How do I sync my UIU schedule?", a: "Go to the Planner tab and use the 'Import Schedule' option. You can upload your routine PDF or manually add courses." },
    { q: "Is the Marketplace safe?", a: "StudentOS is exclusive to verified UIU students. Always meet in public campus areas (like the Cafeteria or Plaza) for transactions." },
    { q: "How do I report a missing item?", a: "Visit the 'Lost & Found' board and click the 'Report Item' button at the top right. Fill in the details and location." },
    { q: "Can I use StudentOS offline?", a: "Most features require an active connection, but your cached schedule and tasks are available offline." }
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto pb-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-on-surface">
          StudentOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Help Center</span>
        </h1>
        <p className="text-on-surface-variant text-lg mt-2">Find answers, learn the ropes, or get in touch with the team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: 'auto_stories', title: 'Knowledge Base', desc: 'Detailed guides on every StudentOS feature.' },
          { icon: 'forum', title: 'Community Support', desc: 'Join the Discord for real-time peer help.' },
          { icon: 'support_agent', title: 'Contact Us', desc: 'Direct line to the platform administrators.' }
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container border border-outline-variant/30 rounded-3xl p-8 text-center hover:bg-surface-container-high transition-all group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">{item.title}</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-10">
        <h2 className="text-2xl font-bold text-on-surface mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">quiz</span>
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/10 hover:border-primary/20 transition-all group">
              <h4 className="text-base font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {faq.q}
              </h4>
              <p className="text-on-surface-variant text-sm pl-4 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-3xl p-10 border border-primary/10 text-center">
        <h2 className="text-2xl font-bold text-on-surface mb-2">Still need help?</h2>
        <p className="text-on-surface-variant mb-8">Our support team is active 24/7 during the trimester peak times.</p>
        <button className="bg-primary text-on-primary px-10 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
          Submit a Ticket
        </button>
      </div>
    </div>
  );
}
