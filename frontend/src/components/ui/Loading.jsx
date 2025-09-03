import PropTypes from 'prop-types';

const Loading = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2bb6c4] mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

Loading.propTypes = {
  message: PropTypes.string
};

Loading.defaultProps = {
  message: "Loading..."
};

export default Loading;
