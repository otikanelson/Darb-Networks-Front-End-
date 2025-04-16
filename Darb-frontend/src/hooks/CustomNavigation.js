import { useNavigate } from 'react-router-dom';

export const CustomNav = () => {
  const nav = useNavigate();

  const navigate = (path) => {
    nav(path);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return navigate;
};
