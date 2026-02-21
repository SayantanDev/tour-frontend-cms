import CircularProgress from '@mui/material/CircularProgress';

const CustomLoader = () => {
  return (
    <div className="loader-wrapper">
      <div className="img-loader"><CircularProgress /></div>
    </div>
  );
};

export default CustomLoader;
