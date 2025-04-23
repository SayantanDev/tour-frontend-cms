import React, { useEffect, useState } from "react";
import { Container, Typography, Button, IconButton } from '@mui/material';
import DataTable from '../../components/dataTable';
import { CONFIG_STR } from '../../configuration';
// import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import PackageDialog from './PackageDialog';
import { getAllPackages, getSinglePackages } from '../../api/packageAPI';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedPackage } from "../../reduxcomponents/slices/packagesSlice";

const AllPackages = () => {
    const [currentTab, setCurrentTab] = useState('sandakphu');
    const [allPackages, setAllPackages] = useState([]);
    const [tableRows, setTableRows] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newD, setNewD] = useState(false);
    const [singleRowData, setSingleRowData] = useState({});
    const navigate = useNavigate();

    const dispatch = useDispatch();



    useEffect(() => {
        getAllPackages()
            .then((res) => {
                setAllPackages(res.data);
                let arr_san = [];
                res.data
                    .filter(pkg => pkg.location === 'Sandakphu')
                    .map((pkg) => {
                        let curObj = {
                            id: pkg._id,
                            title: pkg.label,
                            type: pkg.type,
                            duration: pkg?.details?.header?.h2,
                            cost: (pkg?.type === 'Trek') ? pkg?.details?.cost?.singleCost : pkg?.details?.cost?.multipleCost[0]?.Budget
                        };
                        arr_san.push(curObj);
                        return true;
                    });
                setTableRows(arr_san);
            })
            .catch((err) => {
                console.log('Get packages error:', err);
            });
    }, []);
    useEffect(() => {
        switch (currentTab) {
            case 'sandakphu':
                let arr_san = [];
                allPackages
                    .filter(pkg => pkg.location === 'Sandakphu')
                    .map((pkg) => {
                        let curObj = {
                            id: pkg._id,
                            title: pkg.label,
                            type: pkg.type,
                            duration: pkg?.details?.header?.h2,
                            cost: (pkg?.type === 'Trek') ? pkg?.details?.cost?.singleCost : pkg?.details?.cost?.multipleCost[0]?.Budget
                        };
                        arr_san.push(curObj);
                        return true;
                    });
                setTableRows(arr_san);
                break;
            case 'darjeeling':
                let arr_dar = [];
                CONFIG_STR.sandakphuPackages.map((pkg, index) => {
                    let curObj = {
                        id: index,
                        title: '====',
                        type: '====',
                        duration: '====',
                        cost: '====',
                    };
                    arr_dar.push(curObj);
                    return true;
                });
                setTableRows(arr_dar);
                break;
            case 'sikkim':
                let arr_si = [];
                allPackages
                    .filter(pkg => pkg.location === 'Sikkim')
                    .map((pkg) => {
                        let curObj = {
                            id: pkg._id,
                            title: pkg.label,
                            type: pkg.type,
                            duration: pkg?.details?.header?.h2,
                            cost: pkg?.details?.cost?.valueCost[2]?.price
                        };
                        arr_si.push(curObj);
                        return true;
                    });
                setTableRows(arr_si);
                break;
            default:
                break;
        }
    }, [currentTab]);

    const handleView = async (rowId) => {

        navigate(`/packages/view/${rowId}`);

    }

    const handleEdit = async (rowId) => {
        try {
            const singleData = await getSinglePackages(rowId)
            dispatch(setSelectedPackage(singleData.data));
            navigate(`/packages/edit`);

        } catch (error) {
            console.log("error is :", error);


        }

    }
    const handleDialogClose = () => {
        setSingleRowData({});
        setNewD(false);
        setDialogOpen(false);
    }
    const createNewPackage = () => {
        navigate(`/packages/edit`);
        // setSingleRowData({});
        // setNewD(false);
        // setDialogOpen(true)
    }

    const columns = [
        { field: 'title', headerName: 'Title', width: 290, filterable: true },
        { field: 'type', headerName: 'Type', width: 150, filterable: true },
        { field: 'duration', headerName: 'Duratoin', width: 220, filterable: true },
        { field: 'cost', headerName: 'Cost', width: 150, filterable: true },
        {
            field: 'action',
            headerName: 'Action',
            width: 180,
            renderCell: (params) => (
                <div>
                    <IconButton
                        color="warning"
                        onClick={() => handleView(params.row.id)}
                    >
                        <VisibilityIcon />
                    </IconButton>

                    <IconButton
                        color="primary"
                        onClick={() => handleEdit(params.row.id)}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                    // onClick={() => handleDelete(params.row.id)}
                    >
                        <LocationOffIcon />
                    </IconButton>
                </div>
            ),

        },
    ];

    return (
        <Container>
            <Typography>
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', '& button': { margin: '8px' } }}>
                    <Button
                        variant="contained"
                        size="small"
                        color={currentTab === 'sandakphu' ? "success" : "warning"}
                        sx={{ m: 1 }}
                        onClick={() => setCurrentTab('sandakphu')}
                    >
                        Sandakphu
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        color={currentTab === 'darjeeling' ? "success" : "warning"}
                        sx={{ m: 1 }}
                        onClick={() => setCurrentTab('darjeeling')}
                    >
                        Darjeeling
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        color={currentTab === 'sikkim' ? "success" : "warning"}
                        sx={{ m: 1 }}
                        onClick={() => setCurrentTab('sikkim')}
                    >
                        Sikkim
                    </Button>
                </div>

                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={createNewPackage}
                >
                    Add New Package
                </Button>
            </div>
            <DataTable rows={tableRows} columns={columns} />
            <PackageDialog
                open={dialogOpen}
                singleRowData={singleRowData}
                newD={newD}
                handleClose={handleDialogClose}
            />
        </Container>
    );
}

export default AllPackages;