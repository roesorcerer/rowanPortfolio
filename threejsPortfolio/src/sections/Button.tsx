interface ButtonProps {
  name: string;
  containerClass?: string;  
}

const Button: React.FC<ButtonProps> = ({ name, containerClass }) => {
  return (
    <button className={`${containerClass} text-white`}>
      {name}
    </button>
  );
};

export default Button;