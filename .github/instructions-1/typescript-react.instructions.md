---
applyTo: "**/*.ts,**/*.tsx,**/*.css"
---
# Project coding standards for TypeScript and React

Apply the [general coding guidelines](general-coding.instructions.md) to all code.

## TypeScript Guidelines
- Use TypeScript for all new code
- Follow functional programming principles where possible
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators

## React Guidelines
- Use functional components with hooks
- Follow the React hooks rules (no conditional hooks)
- Use React.FC type for components with children
- Keep components small and focused
- Use CSS modules for component styling
- Use `axios` for making HTTP requests.
- use redux for state management

## styling Guidelines
- create design tokens for colors, typography, spacing, and other design elements
- use this color palette for styling:
    * Primary:
    	White: #FFFFFF
        Navy Blue: #1A237E
        slate Gray: #607D8B
    * Secondary/Accent:
        Sky Blue: #03A9F4
        Emerald Green: #4CAF50
        Red: #F44336 
        Orange: #FF9800
- Typography:
    * use SANS-SERIF fonts like Roboto, Inter or SF Pro
    * use font sizes that are readable on both mobile and web
    * use consistent line heights and letter spacing
    * use more padding and margin for larger web browsers (width > 768px)
- Use react native Dimensions API for responsive design for mobile and web