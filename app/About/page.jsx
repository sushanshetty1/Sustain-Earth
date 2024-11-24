import React from 'react';

const TeamMember = ({ name, role, description, icon, delay, socialLinks }) => {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-lg transform hover:scale-102 hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(251,146,60,0.15)]" style={{ animationDelay: `${delay}s` }}>
      <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center animate-[float_3s_ease-in-out_infinite] group-hover:scale-110 group-hover:rotate-10 transition-transform duration-500">
          <i className={`bi ${icon} text-6xl text-white/90`}></i>
        </div>
      </div>
      <div className="p-6">
        <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-500 text-sm font-medium mb-4">
          {role}
        </span>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-6">{description}</p>
        <div className="flex space-x-5 transition-all duration-300">
          {socialLinks.github && (
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-orange-500 transition-colors duration-300 transform translate-y-5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
              style={{ transitionDelay: '0.1s' }}
            >
              <i className="bi bi-github text-xl"></i>
            </a>
          )}
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-orange-500 transition-colors duration-300 transform translate-y-5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
              style={{ transitionDelay: '0.2s' }}
            >
              <i className="bi bi-linkedin text-xl"></i>
            </a>
          )}
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-orange-500 transition-colors duration-300 transform translate-y-5 opacity-0 group-hover:opacity-100 group-hover:translate-y-0"
              style={{ transitionDelay: '0.3s' }}
            >
              <i className="bi bi-instagram text-xl"></i>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const About = () => {
    const teamMembers = [
        {
          name: "Sushan Shetty",
          role: "Team Lead",
          description: "Full-stack developer dedicated to delivering innovative, scalable, and well-architected solutions.",
          icon: "bi-code-slash",
          delay: 0.1,
          socialLinks: {
            github: "https://github.com/sushanshetty1",
            linkedin: "https://linkedin.com/in/sushanshetty1",
            instagram: "https://instagram.com/sushanshetty_1"
          }
        },
        {
          name: "Yash V Maurya",
          role: "UI/UX Designer",
          description: "Creative problem-solver passionate about designing seamless and visually stunning user interfaces.",
          icon: "bi-palette",
          delay: 0.2,
          socialLinks: {
            github: "https://github.com/Yash-v-maurya",
            linkedin: "https://www.linkedin.com/in/yash-v-maurya/",
            instagram: "https://www.instagram.com/yashh_v_m_/?next=%2F"
          }
        },
        {
          name: "Shaun Marvel Rodrigues",
          role: "Backend Dev",
          description: "Backend specialist focused on building robust, efficient, and scalable database-driven systems.",
          icon: "bi-database",
          delay: 0.3,
          socialLinks: {
            github: "https://github.com/shaunmarv3",
            linkedin: "https://linkedin.com/in/shaun-rodrigues",
            instagram: "https://instagram.com/shaun.marvel"
          }
        },
        {
          name: "Samar Rihan",
          role: "Frontend Dev",
          description: "Frontend enthusiast skilled in crafting responsive, dynamic, and user-friendly web applications.",
          icon: "bi-layout-text-window",
          delay: 0.4,
          socialLinks: {
            github: "https://github.com/sam404rihan",
            linkedin: "https://linkedin.com/in/samar-rihan",
            instagram: "https://instagram.com/samarrihan404"
          }
        }
    ];

  return (
    <div className="min-h-screen pt-40" style={{
      background: '#f8fafc',
      backgroundImage: `
        radial-gradient(circle at 10% 20%, rgba(251, 146, 60, 0.1) 0%, transparent 20%),
        radial-gradient(circle at 90% 80%, rgba(251, 146, 60, 0.1) 0%, transparent 20%)
      `
    }}>
      <main className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <TeamMember
              key={member.name}
              {...member}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default About;