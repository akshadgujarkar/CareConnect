# Care Access Finder

Build a complete, modern, and production-ready frontend for a hackathon project called **Community Health Access Platform**.

### Project Overview:
People in underserved areas miss preventive screenings, vaccination information, and health camps because information is fragmented. 
This platform identifies local healthcare access gaps using sample data and connects residents with verified health camps and public healthcare services.

### Tech Stack (must use):
- React + Vite
- Tailwind CSS
- React-Leaflet + Leaflet
- Lucide React icons
- Functional components only

### Must-Have Features:

1. **Interactive Map (Main Focus)**
   - Show Public Health Facilities (PHC, CHC, Hospital) with blue markers
   - Show Verified Health Camps with green markers
   - Highlight High Access Gap areas with red/orange markers or circles
   - Different marker styles based on type
   - Click on marker → show detailed popup (name, type, services, location, action buttons)
   - Add a clear map legend
   - Map should be centered on the sample data location

2. **Top Dashboard Cards**
   - Total High Access Gaps
   - Upcoming Verified Camps
   - Total Public Facilities
   - Clean card design with icons

3. **Sidebar Filters**
   - Service Type filter (All, Vaccination, Screening, General Health)
   - Toggle: Show only Verified Camps
   - Toggle: Upcoming Camps only
   - Filters should update both the map and the camps list in real-time

4. **Camps List**
   - Display upcoming verified health camps in clean modern cards
   - Each card should show: Camp name, date & time, location, services, verified badge, and “Register Interest” button

5. **Registration Modal**
   - Opens when user clicks “Register Interest”
   - Fields: Full Name, Phone Number, Selected Camp (pre-filled), optional message
   - On submit → save to localStorage and show success toast/message

6. **Layout & Design**
   - Clean professional Navbar with project name + short tagline
   - Layout structure: Sidebar (left) + Map (center) + Camps List (right or bottom)
   - Healthcare color theme: Deep Blue + Teal + White + Soft Gray
   - Modern cards, subtle shadows, good spacing, smooth hover effects
   - Fully responsive
   - Loading states and empty states

### Additional Instructions:
- Create realistic mock/sample data inside the code for facilities, health_camps, and gaps (keep it limited to 1-2 districts)
- Make the UI clean, focused, and demo-ready for a 6-hour hackathon
- Code should be well structured with reusable components
- Prioritize visual clarity and smooth user experience

Generate the complete working frontend now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1a18cf39-3818-4289-b22c-0c8fbbafd987).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
