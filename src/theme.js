import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',

        primary: {
            main: '#6366f1',        // Indigo 500
            light: '#a5b4fc',       // Indigo 300
            dark: '#4f46e5',        // Indigo 600
            contrastText: '#ffffff',
        },

        secondary: {
            main: '#ec4899',        // Pink 500
            light: '#f9a8d4',       // Pink 300
            dark: '#db2777',        // Pink 600
            contrastText: '#ffffff',
        },

        success: {
            main: '#22c55e',        // Green 500
            light: '#86efac',
            dark: '#16a34a',
        },

        warning: {
            main: '#f59e0b',        // Amber 500
            light: '#fde68a',
            dark: '#d97706',
        },

        error: {
            main: '#ef4444',        // Red 500
            light: '#fca5a5',
            dark: '#dc2626',
        },

        info: {
            main: '#3b82f6',        // Blue 500
            light: '#93c5fd',
            dark: '#2563eb',
        },

        background: {
            default: '#f9fafb',     // Neutral gray (eye-soothing)
            paper: '#ffffff',
        },

        text: {
            primary: '#1f2937',     // Gray 800
            secondary: '#6b7280',   // Gray 500
            disabled: '#9ca3af',
        },

        divider: 'rgba(0,0,0,0.08)',
    },

    typography: {
        fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',

        h1: {
            fontSize: '2.6rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontSize: '2.1rem',
            fontWeight: 700,
            letterSpacing: '-0.015em',
        },
        h3: {
            fontSize: '1.8rem',
            fontWeight: 600,
        },
        h4: {
            fontSize: '1.45rem',
            fontWeight: 600,
        },
        h5: {
            fontSize: '1.2rem',
            fontWeight: 600,
        },
        h6: {
            fontSize: '1.05rem',
            fontWeight: 600,
        },

        body1: {
            fontSize: '0.95rem',
            lineHeight: 1.7,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
        },

        button: {
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.03em',
        },
    },

    shape: {
        borderRadius: 14,
    },

    shadows: [
        'none',
        '0px 2px 6px rgba(0,0,0,0.04)',
        '0px 4px 12px rgba(0,0,0,0.06)',
        '0px 8px 24px rgba(0,0,0,0.08)',
        '0px 12px 32px rgba(0,0,0,0.10)',
        '0px 20px 40px rgba(0,0,0,0.12)',
        ...Array(19).fill('0px 20px 40px rgba(0,0,0,0.12)'),
    ],

    components: {
        MuiButton: {
            defaultProps: {
                size: 'medium',
            },
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '8px 20px',
                    transition: 'all 0.25s ease',
                },
                contained: {
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0px 8px 20px rgba(99,102,241,0.3)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        boxShadow: '0px 12px 28px rgba(99,102,241,0.45)',
                    },
                },
                outlined: {
                    borderWidth: 2,
                    '&:hover': {
                        backgroundColor: 'rgba(99,102,241,0.05)',
                    },
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 18,
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0px 8px 28px rgba(0,0,0,0.06)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0px 16px 40px rgba(0,0,0,0.12)',
                    },
                },
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 16,
                },
            },
        },

        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: '#ffffff',
                        '& fieldset': {
                            borderColor: 'rgba(0,0,0,0.15)',
                        },
                        '&:hover fieldset': {
                            borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                            boxShadow: '0px 0px 0px 4px rgba(99,102,241,0.15)',
                        },
                    },
                },
            },
        },

        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0px 8px 28px rgba(99,102,241,0.35)',
                },
            },
        },

        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        backgroundColor: '#6366f1',
                        color: '#ffffff',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                    },
                },
            },
        },

        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(99,102,241,0.04)',
                    },
                },
            },
        },

        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontWeight: 600,
                },
                colorPrimary: {
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                },
                colorSecondary: {
                    background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                    color: '#fff',
                },
            },
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#111827',
                    fontSize: '0.8rem',
                    borderRadius: 8,
                },
            },
        },

        MuiTabs: {
            styleOverrides: {
                indicator: {
                    height: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                },
            },
        },

        MuiSwitch: {
            styleOverrides: {
                track: {
                    backgroundColor: '#c7d2fe',
                },
            },
        },

        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontSize: '0.9rem',
                },
            },
        },
    },
});

export default theme;
