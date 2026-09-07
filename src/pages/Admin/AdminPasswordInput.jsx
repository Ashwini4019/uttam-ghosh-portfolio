import { useState } from "react";

const AdminPasswordInput = ({ id, value, onChange, ...inputProps }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="admin-password-wrap">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        {...inputProps}
      />
      <button
        type="button"
        className="admin-password-toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={id}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
};

export default AdminPasswordInput;
