import React, { useState } from "react";
import LeftColumn from './leftColumn';
import MiddleColumn from './middleColumn';
import RightColumn from './rightColumn';
import { Container, Typography, Grid } from '@mui/material';

const SandakphuCreateEditForm = ({
    sandakphuFormData,
    handleSandakphuChange,
    handleSandakDtlChange,
    handleSandakphuFileChange,
    handleSandakphuSubmit,
    handleClose,
}) => {
    const [ clickedButton, setClickedButton ] = useState('Header');
    // const [ pageDetails, setPageDetails ] = useState(sandakphuFormData?.details);

    
    return (
        <Container>
            {sandakphuFormData? (<form>
                <Grid container spacing={2}>
                    <LeftColumn 
                        handleSandakphuFileChange={handleSandakphuFileChange}
                        handleSandakphuChange={handleSandakphuChange}
                        sandakphuFormData={sandakphuFormData}
                        handleSandakphuSubmit={handleSandakphuSubmit}
                        handleClose={handleClose}
                    />
                    <MiddleColumn
                        setClickedButton={setClickedButton}
                        clickedButton={clickedButton}
                    />
                    <RightColumn
                        sandakphuFormData={sandakphuFormData}
                        clickedButton={clickedButton}
                        handleSandakDtlChange={handleSandakDtlChange}
                        handleSandakphuChange={handleSandakphuChange}
                    />
                </Grid>
            </form>)
            : <Typography variant="body1">Loading...</Typography>
            }
        </Container>
    );
}
  
export default SandakphuCreateEditForm;