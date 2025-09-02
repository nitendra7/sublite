import React from "react";

const SectionHeader = ({ icon: Icon, title, actions, className = "", ...props }) => (
  <header className={`flex items-center gap-2 mb-6 ${className}`} {...props}>
    {Icon && <Icon className="text-blue-500" size={28} aria-hidden="true" />}
    <h2 className="text-2xl font-bold tracking-tight text-blue-700 flex items-center gap-2">{title}</h2>
    {actions && <div className="ml-auto">{actions}</div>}
  </header>
);

export default SectionHeader;