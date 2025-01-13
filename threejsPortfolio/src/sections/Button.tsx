interface ButtonProps {
  name: string;
  containerClass?: string;
  isBeam?: boolean;  
}

const Button: React.FC<ButtonProps> = ({ name, containerClass }) => {
  return (
    <button className={`${containerClass} text-white`}>
      {name}
    </button>
  );
};

export default Button;