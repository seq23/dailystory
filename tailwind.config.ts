import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'xs': '475px',
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px',
				'mobile-tablet': '1024px', // Shows content on mobile + tablet (≤1024px)
			}
		},
		extend: {
			fontFamily: {
				'comic': ['Comic Neue', 'cursive', 'sans-serif'],
				'fun': ['Fredoka', 'cursive', 'sans-serif'],
				'schoolbell': ['Schoolbell', 'cursive', 'sans-serif'],
				'inter': ['Inter', 'ui-sans-serif', 'system-ui'],
				'sans': ['Fredoka', 'ui-sans-serif', 'system-ui'],
				// Multilingual font families
				'arabic': ['Tajawal', 'Amiri', 'sans-serif'],
				'arabic-fun': ['Amiri', 'Tajawal', 'serif'],
				'chinese': ['Noto Sans SC', 'Ma Shan Zheng', 'sans-serif'],
				'chinese-fun': ['Ma Shan Zheng', 'Noto Sans SC', 'serif'],
				'hindi': ['Noto Sans Devanagari', 'Kalam', 'sans-serif'],
				'hindi-fun': ['Kalam', 'Noto Sans Devanagari', 'cursive'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'3xl': '1.5rem'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)'
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)'
			},
			transitionTimingFunction: {
				'bounce': 'var(--transition-bounce)',
				'smooth': 'var(--transition-smooth)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'bounce-gentle': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-20px)'
					}
				},
				'wiggle': {
					'0%, 100%': {
						transform: 'rotate(-3deg)'
					},
					'50%': {
						transform: 'rotate(3deg)'
					}
				},
				'shake-hard': {
					'0%, 100%': {
						transform: 'translateX(0)'
					},
					'5%, 15%, 25%, 35%, 45%, 55%, 65%, 75%, 85%, 95%': {
						transform: 'translateX(-12px)'
					},
					'10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90%': {
						transform: 'translateX(12px)'
					}
				},
				'flash': {
					'0%, 50%, 100%': {
						opacity: '1'
					},
					'25%, 75%': {
						opacity: '0.3'
					}
				},
				'celebration': {
					'0%': {
						transform: 'scale(0) rotate(0deg)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.2) rotate(180deg)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(1) rotate(360deg)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.8)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'edgeBounce': {
					'0%': {
						transform: 'scale(1) rotate(0deg)'
					},
					'25%': {
						transform: 'scale(1.15) rotate(2deg)'
					},
					'50%': {
						transform: 'scale(1.1) rotate(-1deg)'
					},
					'75%': {
						transform: 'scale(1.05) rotate(1deg)'
					},
					'100%': {
						transform: 'scale(1) rotate(0deg)'
					}
				},
				'edgeGlowPulse': {
					'0%': {
						boxShadow: '0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.2), 0 0 60px hsl(var(--primary) / 0.1)'
					},
					'50%': {
						boxShadow: '0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.4), 0 0 100px hsl(var(--primary) / 0.3)'
					},
					'100%': {
						boxShadow: '0 0 20px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.2), 0 0 60px hsl(var(--primary) / 0.1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'wiggle': 'wiggle 0.5s ease-in-out',
				'shake-hard': 'shake-hard 0.8s ease-in-out infinite',
				'flash': 'flash 1s ease-in-out infinite',
				'celebration': 'celebration 1.5s ease-out forwards',
				'scale-in': 'scale-in 0.3s ease-out',
				'edgeBounce': 'edgeBounce 0.6s ease-out',
				'edgeGlowPulse': 'edgeGlowPulse 2s ease-in-out 3'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
