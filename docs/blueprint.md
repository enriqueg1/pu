# **App Name**: EnerDash

## Core Features:

- Real-time Power Monitoring: Displays the current power consumption in watts fetched from Firebase Realtime Database.
- Daily Consumption Calculation: Calculates and displays the energy consumption for the current day in kWh, and its estimated cost, by multiplying it by a predefined rate.
- Total Energy Consumption Tracking: Keeps track of the total energy consumption in kWh since the start of the monitoring and displays this number.
- Historical Data Visualization: Presents the energy consumption data for the last 7 days using a bar chart, which is generated from the data stored in the Firebase Realtime Database.
- Connectivity Status Indicator: Checks the last updated timestamp from Firebase. Changes the status indicator to green if the timestamp is within the last minute; otherwise, turns the indicator to red if older.

## Style Guidelines:

- Primary color: Neon green (#00FF88) for highlighting key energy data, representing efficiency and real-time updates.
- Background color: Dark background (#1A1A1A) for a modern, dark mode aesthetic, improving focus on data.
- Accent color: Blue (#00D2FF) to emphasize totals and provide a complementary contrast against the neon green.
- Font: 'Inter' (sans-serif) for a clean, modern, and readable dashboard interface.