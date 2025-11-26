Sorting Visualizer

This project is a simple web application that visualizes how different sorting algorithms work. It is built using React, Vite and basic CSS.

Features:

Random array generation with adjustable size
Supports Bubble Sort, Selection Sort, Insertion Sort, Merge Sort and Quick Sort
Adjustable animation speed
Start and Stop controls
Highlights compared, swapped and sorted elements
Displays total comparisons and swaps
Responsive and clean interface

How It Works:

React useState is used to store the array, algorithm, size, speed and highlight states.
Sorting algorithms run as async functions using normal logic but with pauses for animation.
A function named visualize updates the array and UI, then waits for a short delay to create the animation.
A cancelRef flag is used so the sort can be stopped immediately when the Stop button is pressed.

Tech Stack:

React
Vite
JavaScript
CSS

How To Run:

1. Install dependencies:
npm install

2. Start development server:
npm run dev

3. Open the URL shown in the terminal (usually http://localhost:5173)

File Structure:

App.jsx – Main component containing UI and sorting logic
main.jsx – Entry point
index.css – Styling
vite.config.js – Vite configuration

Optional Future Improvements:

Add pseudocode view for each algorithm
Add side-by-side algorithm comparison
Add light/dark theme toggle
