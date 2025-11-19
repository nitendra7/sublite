import PropTypes from "prop-types";

const SectionHeader = ({ icon: Icon, title, actions, className = "", ...props }) => (
  <header className={`flex items-center gap-3 mb-8 ${className}`} {...props}>
    {Icon && <Icon className="text-[#2bb6c4] dark:text-[#5ed1dc]" size={32} aria-hidden="true" />}
    <h2 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-gray-100">{title}</h2>
    {actions && <div className="ml-auto">{actions}</div>}
  </header>
);

SectionHeader.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  actions: PropTypes.node,
  className: PropTypes.string
};

SectionHeader.defaultProps = {
  className: ""
};

export default SectionHeader;