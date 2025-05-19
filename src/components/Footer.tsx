
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border py-6 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-primary">
              Narpavi <span className="text-accent">Handicrafts</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Celebrating India's rich cultural heritage through exquisite handcrafted treasures
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Narpavi Handicrafts. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
