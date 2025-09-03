import PropTypes from "prop-types";

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white p-6 rounded-lg shadow border flex flex-col gap-1 items-start min-h-[120px]">
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="text-blue-400" size={22} aria-hidden="true" />}
      <span className="text-gray-700 text-sm">{label}</span>
    </div>
    <span className="text-2xl xl:text-3xl text-blue-900 font-bold">{value}</span>
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default StatCard;
