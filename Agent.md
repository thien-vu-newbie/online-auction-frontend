# Agent Coding Guidelines

These guidelines define how the AI assistant should generate code, UI components, and architectural patterns across the entire system. The goal is to maintain **maximum consistency**, **design-system alignment**, and **high-quality modern UI/UX standards**.

---

## 🎯 Core Principles

### 1. **Consistency Across the Entire System**

* Always prefer **shared components** over custom per‑feature solutions.
* Reuse existing patterns, naming conventions, folder structures, and hooks.
* Ensure all new code integrates smoothly with the established design system.

### 2. **Follow the Global Design System**

* Do **not** mix different design patterns for different modules.
* Avoid introducing new UI behaviors unless truly necessary and beneficial.
* All components should align with the system’s spacing rules, color scale, typography, and interaction patterns.

---

## 🧩 UI Components

### 3. **Use shadcn/ui Components First**

* All UI elements must use **shadcn/ui** whenever possible.
* Only write custom components when:

  * No shadcn component solves the requirement,
  * The design deviation is intentional and approved,
  * Or the component is unique, reusable, and added to the shared library.

### 4. **Icons Must Use Phosphor Icons**

* Default icon set: **Phosphor Icons**.
* Avoid mixing icon libraries.
* Stick to the outlined/regular style unless the design explicitly calls for bold/duotone.

---

## 🎨 Styling Guidelines

### 5. **Limit Manual CSS**

* Prefer utility classes (Tailwind) and component props.
* Only write custom CSS for:

  * Complex layouts,
  * Reusable animations,
  * Responsive behavior not achievable with utilities.
* Avoid large CSS blocks inside components.

### 6. **Modern and Expressive UI**

* The UI must look **modern**, **dynamic**, and **engaging**.
* Allowed modern enhancements:

  * Gradients (subtle and tasteful)
  * Soft shadows
  * Glassmorphism (light use)
  * Smooth micro-interactions
  * Motion and animations (Framer Motion encouraged)

### 7. **Avoid Overly Simple / Plain UI**

* Avoid dull, lifeless designs.
* Always consider visual hierarchy, depth, and motion.
* Use spacing, color contrast, iconography, and motion to create polish.

---

## ⚙️ Code & Architecture Standards

### 8. **Clean and Maintainable Code**

* Follow component decomposition logic.
* Avoid deeply nested logic in JSX.
* Prefer reusable hooks for shared logic.
* Keep files small, readable, and consistent.

### 9. **Naming Conventions**

* Use clear, descriptive names.
* No abbreviations unless universally understood.
* Stick to consistent naming for:

  * Files
  * Folders
  * Props
  * Hooks
  * State variables

### 10. **Code Generation Rules for the AI**

* Always generate production-quality code.
* Do not output untested patterns.
* Prefer stable libraries and patterns.
* Provide minimal but effective boilerplate.
* Ensure accessibility (ARIA attributes, keyboard navigation where possible).

---

## ⚡ Interaction & Animation

### 11. **Use Framer Motion for Animations**

* Default animation library.
* Animations should be smooth, subtle, and not distracting.
* Use motion presets like fade, slide, scale, stagger.

### 12. **Response and Feedback**

* Buttons, inputs, and interactive elements must have clear hover/active states.
* Use transitions for:

  * Hover
  * Press
  * Page transitions
  * Menu opening/closing

---

## 🛠 Recommended Libraries

* **UI**: shadcn/ui
* **Icons**: Phosphor Icons
* **Animations**: Framer Motion
* **Styling**: TailwindCSS
* **Charts (if needed)**: Recharts
* **State Management**: Zustand/Redux depending on system design

---

## ✔ Final Notes

* Maintain consistency above all else.
* Always align with shared components.
* Avoid reinventing UI items.
* Keep the interface modern, polished, and animated.
* Prioritize maintainability and long-term scalability.

These guidelines ensure the entire system stays unified, professional, and scalable—even with AI-generated code.
