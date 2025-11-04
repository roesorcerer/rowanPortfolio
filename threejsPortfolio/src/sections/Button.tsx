interface ButtonProps {
  name: string;
  containerClass?: string;
  isBeam?: boolean;  
}

const Button: React.FC<ButtonProps> = ({ name, containerClass, isBeam }) => {
  return (
    <button className={`btn ${containerClass}`}>
      {isBeam && (
        <span className="relative flex h-3 w-3">
          <span className="btn-ping" />
          <span className="btn-ping_dot" />
        </span>
      )}
      {name}
    </button>
  );
};

export default Button;