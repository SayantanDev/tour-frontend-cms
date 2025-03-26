import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, IconButton, Button, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SandakphuCreateEditForm from './SandakphuCreateEditForm';
import SikkimCreateEditForm from './SikkimCreateEditForm';
import DarjeelingCreateEditForm from './DarjeelingCreateEditForm';
import { addPackage, updatePackage, deletePackage } from '../../api/packageAPI';

const initialData = {
    disabled: false,
    image: "https://tourismpic.blob.core.windows.net/tourism-container/sikkimPackages/goechala-trek.jpg",
    tags: ["Sikkim", "Adventure", "Trek", "Goecha La"],
    location: "Sikkim",
    type: "Adventure",
    url: "goechala-trek",
    label: "Goechala Trek",
    details: {
        header: {
            h1: "Goechala Trek",
            h2: "10 NIGHTS AND 11 DAYS",
        },
        overview: {
            para: "<p>Goechala Trek is nestled in the Kanchenjungha Nation Park in Sikkim, which thus unveils the mighty southeastern side of Kanchenjungha. This trek is one of the most prized jewels of the Himalayas and proudly demonstrates some of the most wondrous beauty of northeast India.</p>",
        },
        shortItinerary: [
            {
                tagName: "Day 1",
                tagValue: "NJP/Bagdogra to Yuksom" 
            },
            {
                tagName: "Day 2",
                tagValue: "Yuksom to Sachen" 
            },
            {
                tagName: "Day 3",
                tagValue: "Sachen to Tshoka" 
            },
            {
                tagName: "Day 4",
                tagValue: "Tshoka to Dzongri" 
            },
            {
                tagName: "Day 5",
                tagValue: "Dzongri to Dzongri top (Acclimatization)" 
            },
            {
                tagName: "Day 6",
                tagValue: "Dzongri to Thansing" 
            },
            {
                tagName: "Day 7",
                tagValue: "Thansing to Lamuney" 
            },
            {
                tagName: "Day 8",
                tagValue: "Lamuney to Goecha La via Samiti Lake and back to Thansing" 
            },
            {
                tagName: "Day 9",
                tagValue: "Thansing to Tshoka" 
            },
            {
                tagName: "Day 10",
                tagValue: "Tshoka to Yuksom" 
            },
            {
                tagName: "Day 11",
                tagValue: "Yuksom to NJP/Bagdogra drop" 
            }
        ],
        itinerary: [
            {
                headerTag: "Day 1",
                headerValue: "NJP/Bagdogra to Yuksom",
                Distance: "",
                Duration: "7 hours",
                Altitude: "5,670 ft",
                para: "<p>Upon your arrival at NJP (New Jalpaiguri) railway station or Bagdogra airport, our representative will warmly welcome you. From there, we will drive you to Yuksom. You will enjoy a long scenic drive amidst the long stretch of lush green landscapes and feel the thrill of the winding roads across west Sikkim. This journey will take nearly 7 hours, depending on the condition of the terrain. After you arrive at Yuksom, you will check into the pre-booked lodge or guesthouse. You are free to explore the surrounding quaint villages and relax for the rest of the day..</p>"
            },
            {
                headerTag: "Day 2",
                headerValue: "Yuksom to Sachen",
                Distance: "",
                Duration: "",
                Altitude: "7,150 ft",
                para: "<p>Yuksom is your starting point for your trek, after breakfast.Today will be your first day of trek. This trek will transverse you through dense oak and pine forests and rhododendron blossoms. It will be a thrilling experience to cross three to four suspension bridges over the rivers..</p>"
            },
            {
                headerTag: "Day 3",
                headerValue: "Sachen to Tshoka",
                Distance: "7 Km",
                Duration: "5 hours",
                Altitude: "9,700 Ft",
                para: "<p>Begin your morning with an exhilarating day trek, crossing pristine rivers and traversing through dense forests, immersing yourself in nature’s tranquility. As you progress, you will reach Bhakim, a small yet picturesque settlement, where your journey continues through scenic trails for the rest of the day. Eventually, you will arrive in Tshoka, a Tibetan refugee settlement that offers breathtaking panoramic views of the majestic Mt. Pandim. This invigorating trek covers approximately 7 km and takes around 5 hours to complete, culminating at an elevation of 9,700 feet in Tshoka.</p>"
            },
            {
                headerTag: "Day 4",
                headerValue: "Tshoka to Dzongri",
                Distance: "10 Km",
                Duration: "7 hours",
                Altitude: "13024 Ft",
                para: "<p>Embark on a challenging ascent from Tshoka to Dzongri, navigating steep trails that wind through enchanting rhododendron forests. Midway, take a well-deserved break at Phedang, where you can enjoy lunch and refresh before resuming your trek. As you approach Dzongri, you will be rewarded with breathtaking views of vast, rolling meadows surrounded by towering mountain peaks. This demanding yet rewarding journey covers approximately 10 km and takes around 7 hours to complete, culminating at an impressive elevation of 13,024 feet in Dzongri..</p>"
            },
            {
                headerTag: "Day 5",
                headerValue: "Dzongri to Dzongri top (Acclimatization)",
                Distance: "",
                Duration: "",
                Altitude: "13778 Ft",
                para: "<p>Before dawn, embark on an early morning hike to Dzongri Top, where you will witness a breathtaking sunrise over the majestic Mt. Kanchenjunga, painting the sky in hues of gold and crimson. After this mesmerizing experience, spend the rest of the day acclimatizing to the high altitude, allowing your body to adjust while exploring the stunning landscapes of Dzongri. Take in the panoramic views of vast meadows surrounded by towering mountain peaks, offering a serene and unforgettable experience. The hike to Dzongri Top covers approximately 2 km, making it a short yet rewarding journey amidst the grandeur of the Himalayas.</p>"
            },
            {
                headerTag: "Day 6",
                headerValue: "Dzongri to Thansing",
                Distance: "10 Km",
                Duration: "6 hours",
                Altitude: "12900 Ft",
                para: "<p>Begin your trek to Thansing with a descending trail through dense rhododendron forests, leading to the serene settlement of Kokchurang. From here, cross the gushing River Prek Chu via a sturdy bridge before embarking on an uphill climb towards Thansing. Upon arrival, you will be greeted by a vast expanse of meadows, offering a spectacular and unobstructed view of the majestic Mt. Pandim. This scenic and rewarding journey covers approximately 10 km and takes around 6 hours to complete, culminating at an elevation of 12,900 feet in Thansing.</p>"
            },
            {
                headerTag: "Day 7",
                headerValue: "Thansing to Lamuney",
                Distance: "4 Km",
                Duration: "3 hours",
                Altitude: "13600 Ft",
                para: "<p>Embark on a short yet scenic trek from Thansing to Lamuney, traversing gentle trails that gradually lead to higher altitudes. Upon reaching Lamuney, take the rest of the day to relax and acclimatize, conserving energy for the challenging Goechala Trek ahead. Surrounded by breathtaking landscapes, this peaceful stop offers the perfect opportunity to prepare both physically and mentally for the summit day. Covering a distance of 4 km in approximately 3 hours, this trek brings you to an elevation of 13,600 feet, setting the stage for the grand ascent to Goechala.</p>"
            },
            {
                headerTag: "Day 8",
                headerValue: "Lamuney to Goecha La via Samiti Lake and back to Thansing",
                Distance: "16 Km",
                Duration: "12 hours",
                Altitude: "16207 Ft",
                para: "<p>Begin your trek to Goecha La before dawn, venturing into the crisp morning air under a starlit sky. As you ascend, pass by the pristine Samiti Lake, its still waters reflecting the towering peaks around it, creating a scene of surreal beauty. Press onward to the summit, where the breathtaking, up-close view of Mt. Kanchenjunga awaits, a sight that will leave you in awe. After soaking in the grandeur of the Himalayas, begin your descent back to Thansing, retracing your steps through the mesmerizing landscape. This challenging yet rewarding journey covers 16 km over approximately 12 hours, making it a truly unforgettable adventure.</p>"
            },
            {
                headerTag: "Day 9",
                headerValue: "Thansing to Tshoka",
                Distance: "16 Km",
                Duration: "7 hours",
                Altitude: "9700 Ft",
                para: "<p>Begin your return trek as you retrace your steps back to Tshoka, descending through the ever-changing landscapes of the Himalayas. With each step, witness the transformation of the terrain—from rugged, high-altitude meadows to lush rhododendron forests, painted in vibrant hues. The crisp mountain air and serene surroundings make this journey as mesmerizing as the ascent. As you make your way down, take in the breathtaking views one last time, cherishing the beauty of nature’s masterpiece. Covering 16 km in approximately 7 hours, this trek leads you back to the tranquil refuge of Tshoka, nestled at an elevation of 9,700 feet.</p>"
            },
            {
                headerTag: "Day 10",
                headerValue: "Tshoka to Yuksom",
                Distance: "15 Km",
                Duration: "7 hours",
                Altitude: "5670 Ft",
                para: "<p>As your incredible journey through the Himalayas nears its end, continue your descent towards Yuksom, following winding trails that lead you back through dense forests and serene landscapes. With every step, reflect on the breathtaking sights and unforgettable experiences that have defined this adventure. Upon reaching Yuksom, take a moment to celebrate your remarkable achievement—the successful completion of this challenging yet rewarding trek. Covering 15 km in approximately 7 hours, this final stretch marks the end of an unforgettable expedition, leaving you with cherished memories and a deep connection to the majestic mountains.</p>"
            },
            {
                headerTag: "Day 11",
                headerValue: "Yuksom to NJP/Bagdogra drop",
                Distance: "",
                Duration: "",
                Altitude: "",
                para: "<p>After a hearty breakfast, bid farewell to the serene landscapes of Yuksom as you begin your journey back to NJP. The scenic drive, spanning nearly seven hours, takes you through winding mountain roads, offering a final glimpse of the breathtaking Himalayas. As you descend further, the towering peaks slowly fade into the distance, leaving behind cherished memories of your incredible adventure. By evening, you will arrive at NJP, marking the official end of this unforgettable journey—one filled with challenges, triumphs, and awe-inspiring moments amidst nature’s grandeur.</p>"
            }
        ],
        cost: {
            singleCost: 16000,
            valueCost: [],
            multipleCost: [],
            inclusions: [
                "All accommodation as per itinerary.",
                "All sightseeing as per itinerary.",
                "Breakfast in Gangtok, Breakfast and Dinner in Lachen and Lachung.",
                "All tolls, taxes, parking charges and driver allowances."
            ],
            exclusions: [
                "Any personal expenses.",
                "Car on disposal.",
                "Any extra snacks/beverages/meals.",
                "Any extra services availed at the hotels.",
                "Anything not mentioned in the inclusions."
            ]
        },
        thingsToCarry: {
            Basics: [
                "A sturdy ruck-sack with support rod(50-60 ltrs).",
                "A small day pack(15-20 ltrs) in case you are off loading your bag.",
                "A trekking shoe with ankle support."
            ],
            Documents: [
                "Photocopy of a Govt. issued id.",
                "2 recent passport size photos.",
                "Medical certificate.",
                "Disclaimer Certificate."
            ],
            Clothing: [
                "4 pairs of polyester T shirt.",
                "3 Pairs of quick dry trek pants.",
                "A lightweight Hollowfill/Feather jacket.",
                "A set of thermal inners(For winters).",
                "A fleece Jacket(For winters).",
                "A rain coat/Poncho.",
                "4 pairs of cotton socks + 2 pairs of woolen socks.",
                "1 Pair of gloves."
            ],
            Medicine: [
                "Coca 30: 30 ml.",
                "Crocin: 6 tablets.",
                "Avomine: 4 tablets.",
                "Avil(25 mg): 4 tablets.",
                "Combiflam: 4 tablets.",
                "Norflox TZ: 6 tablets.",
                "Digene: 6 tablets.",
                "ORS: 6 sachets.",
                "Band Aid: 6 strips.",
                "Eno: 4 sachets.",
                "Betadine or any antiseptic ointment.",
                "Pain spray.",
                "Knee cap and crepe bandage."
            ],
            Toiletries: [
                "Sunscreen.",
                "Moisturizer.",
                "Lip Balm.",
                "Hand Sanitizer.",
                "Tooth brush & paste.",
                "Toilet Paper.",
                "Light and preferable quick dry towel.",
                "Hand Wash/Liquid Soap."
            ],
            Accessories: [
                "A pair of sun shades.",
                "A cap/sun hat.",
                "A head torch.",
                "Hand Sanitizer.",
                "Trekking Pole.",
                "Toilet Paper.",
                "Water bottle."
            ]
        }
    }
};

const CustomDialog = ({ open, singleRowData, newD, handleClose }) => {
    const [ pkgImage, setPkgImage ] = useState(null);
    const [ currentLoc, setCurrentLoc ] = useState('sandakphu');
    const [ sandakphuFormData, setSandakphuFormData ] = useState(initialData);

    const handleSandakphuChange = (e) => {
        const { name, value } = e.target;
        setSandakphuFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
    };
    const handleSandakDtlChange = (val) => {
        setSandakphuFormData((prevData) => ({
          ...prevData,
          'details': val,
        }));
    };

    const handleSandakphuFileChange = (event) => {
        if (event.target.files[0]) {
            setPkgImage(event.target.files[0]);
        }
    };
      
    const handleSandakphuSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('pkgImage', pkgImage);
        for (const key in sandakphuFormData) {
            if (typeof sandakphuFormData[key] === 'object') {
                formData.append(key, JSON.stringify(sandakphuFormData[key]));
            } else if (sandakphuFormData.hasOwnProperty(key)) {
                formData.append(key, sandakphuFormData[key]);
            }
        }
        
        addPackage(formData)
            .then((res) => {
                handleClose();
            })
            .catch((err) => {});
    };
    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '12px',
                    border: '2px solid #4fc4d1',
                },
            }}
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span>Create New Package</span>
                    <Button 
                        variant="contained" 
                        size="small" 
                        color={currentLoc==='sandakphu'? "info" : "error"} 
                        sx={{ m: 1 }}
                        onClick={() => setCurrentLoc('sandakphu')}
                    >
                        Sandakphu
                    </Button>
                    <Button 
                        variant="contained" 
                        size="small" 
                        color={currentLoc==='darjeeling'? "info" : "error"} 
                        sx={{ m: 1 }}
                        onClick={() => setCurrentLoc('darjeeling')}
                    >
                        Darjeeling
                    </Button>
                    <Button 
                        variant="contained" 
                        size="small" 
                        color={currentLoc==='sikkim'? "info" : "error"} 
                        sx={{ m: 1 }}
                        onClick={() => setCurrentLoc('sikkim')}
                    >
                        Sikkim
                    </Button>
                    <IconButton aria-label="close" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                {/* ====================================== */}
                <Grid container spacing={2} style={{ padding: '10px' }}>
                    {currentLoc==='sandakphu' && 
                        <SandakphuCreateEditForm 
                            sandakphuFormData={sandakphuFormData}
                            handleSandakphuChange={handleSandakphuChange}
                            handleSandakDtlChange={handleSandakDtlChange}
                            handleSandakphuFileChange={handleSandakphuFileChange}
                            handleSandakphuSubmit={handleSandakphuSubmit}
                            handleClose={handleClose}
                        />
                    }
                    {currentLoc==='sikkim' && <SikkimCreateEditForm />}
                    {currentLoc==='darjeeling' && <DarjeelingCreateEditForm />}
                    
                </Grid>
                {/* ====================================== */}
            </DialogContent>
            
        </Dialog>
    );
};

export default CustomDialog;