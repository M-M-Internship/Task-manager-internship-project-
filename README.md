# Task Manager Web App

Task Manager Web App is a React + Vite project focused on making day-to-day task tracking feel fast and approachable. The app currently runs fully on the frontend and lets users add tasks with a title, optional description, deadline, and priority, open task details in a separate dialog, update or delete existing tasks, and get instant feedback through success snackbars. It is designed as a clean starting point for a richer productivity app that can later connect to a real backend and persistent database.

## Install and Run

```bash
npm install

```

Other useful commands:

```bash
npm run dev

```





## Learnings & Challenges

- Managing task data became easier once the list moved from static mock data into React state.
- Keeping add, update, and delete flows consistent required a shared task shape with title, description, deadline, priority, and status.
- Designing dialog-based flows highlighted the need for clear close behavior, keyboard handling, and focus management.
- Making the list title-only while still keeping task details easy to access improved the main screen's readability.
- Snackbar feedback helped reinforce successful actions without pulling users away from the task list.
- Responsive layout work showed how quickly desktop-friendly task cards can feel crowded on smaller screens.


