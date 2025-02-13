import PropTypes from 'prop-types';
import './burgerButton.css';

const BurgerButton = ({ handleClick, clicken }) => {
  return (
    <div onClick={handleClick} className={`icon nav-icon-5 ${clicken ? 'open' : ''}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

BurgerButton.propTypes = {
  handleClick: PropTypes.func.isRequired, 
  clicken: PropTypes.bool, // Validación del prop clicken
};

export default BurgerButton;
