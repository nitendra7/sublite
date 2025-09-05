# Basic Components

## Table of Contents
- [Avatar](#avatar)
- [Badge](#badge)
- [Button](#button)
- [Input](#input)
- [Progress](#progress)
- [Select](#select)
- [Skeleton](#skeleton)
- [Switch](#switch)
- [Tooltip](#tooltip)

## Avatar

The Avatar component displays a user's profile picture, initials, or fallback icon.

### Import

```jsx
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
```

### Component Structure

- `Avatar`: The root container component
- `AvatarImage`: The image element
- `AvatarFallback`: The fallback element displayed when the image fails to load

### Common Props

#### Avatar
- `className`: Additional CSS classes
- `children`: Avatar content (typically AvatarImage and AvatarFallback)
- `asChild`: Boolean to merge props onto child
- `onLoadingStatusChange`: Function called when loading status changes

#### AvatarImage
- `className`: Additional CSS classes
- `src`: Image source URL
- `alt`: Alternative text for the image
- `onLoadingStatusChange`: Function called when loading status changes
- `asChild`: Boolean to merge props onto child

#### AvatarFallback
- `className`: Additional CSS classes
- `children`: Fallback content (typically initials or icon)
- `delayMs`: Delay in milliseconds before showing the fallback
- `asChild`: Boolean to merge props onto child

### Examples

#### Basic Avatar

```jsx
<Avatar>
  <AvatarImage src="https://example.com/avatar.jpg" alt="User's avatar" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

#### Avatar with Custom Styling

```jsx
<Avatar className="h-12 w-12 border-2 border-primary">
  <AvatarImage src="https://example.com/avatar.jpg" alt="User's avatar" />
  <AvatarFallback className="bg-primary text-white">JD</AvatarFallback>
</Avatar>
```

## Badge

The Badge component is used to highlight status, counts, or labels.

### Import

```jsx
import { Badge, badgeVariants } from "../components/ui/badge";
```

### Common Props

- `className`: Additional CSS classes
- `variant`: Visual style variant (default, secondary, destructive, outline, success, warning)
- `children`: Badge content
- `onClick`: Function called when badge is clicked
- `onMouseEnter`: Function called when mouse enters badge
- `onMouseLeave`: Function called when mouse leaves badge
- `id`: Badge ID
- `style`: Inline styles
- `title`: Badge title attribute

### Examples

#### Basic Badge

```jsx
<Badge>New</Badge>
```

#### Badge Variants

```jsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
```

#### Interactive Badge

```jsx
<Badge onClick={() => console.log('Badge clicked')} variant="outline">
  Click me
</Badge>
```

## Button

The Button component is used for actions and navigation.

### Import

```jsx
import { Button, buttonVariants } from "../components/ui/button";
```

### Common Props

- `className`: Additional CSS classes
- `variant`: Visual style variant (default, destructive, outline, secondary, ghost, link)
- `size`: Button size (default, sm, lg, icon)
- `asChild`: Boolean to merge props onto child
- `children`: Button content
- `disabled`: Boolean to disable the button
- `onClick`: Function called when button is clicked
- `type`: Button type (button, submit, reset)
- `onFocus`: Function called when button receives focus
- `onBlur`: Function called when button loses focus
- `id`: Button ID
- `name`: Button name
- `form`: ID of form the button belongs to
- `value`: Button value
- `tabIndex`: Tab index for keyboard navigation
- `aria-label`: Accessible label
- `aria-describedby`: ID of element describing the button
- `aria-pressed`: Boolean indicating pressed state

### Examples

#### Basic Button

```jsx
<Button>Click me</Button>
```

#### Button Variants

```jsx
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

#### Button Sizes

```jsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><IconComponent /></Button>
```

#### Form Submit Button

```jsx
<Button type="submit" form="my-form">Submit</Button>
```

## Input

The Input component is used for collecting user input.

### Import

```jsx
import { Input } from "../components/ui/input";
```

### Common Props

- `className`: Additional CSS classes
- `type`: Input type (text, password, email, etc.)
- `value`: Input value
- `defaultValue`: Default input value
- `placeholder`: Placeholder text
- `disabled`: Boolean to disable the input
- `required`: Boolean indicating if input is required
- `readOnly`: Boolean indicating if input is read-only
- `onChange`: Function called when input value changes
- `onFocus`: Function called when input receives focus
- `onBlur`: Function called when input loses focus
- `name`: Input name
- `id`: Input ID
- `autoComplete`: Input autocomplete attribute
- `autoFocus`: Boolean to automatically focus the input
- `min`: Minimum value (for number inputs)
- `max`: Maximum value (for number inputs)
- `step`: Step value (for number inputs)

### Examples

#### Basic Input

```jsx
<Input placeholder="Enter your name" />
```

#### Email Input

```jsx
<Input type="email" placeholder="Enter your email" required />
```

#### Number Input with Constraints

```jsx
<Input type="number" min="0" max="100" step="5" defaultValue="50" />
```

#### Disabled Input

```jsx
<Input disabled value="This input is disabled" />
```

## Progress

The Progress component displays the completion status of a task or process.

### Import

```jsx
import { Progress } from "../components/ui/progress";
```

### Common Props

- `className`: Additional CSS classes
- `value`: Current progress value
- `max`: Maximum progress value (default: 100)
- `variant`: Visual style variant (default, success, warning, error)

### Examples

#### Basic Progress

```jsx
<Progress value={60} />
```

#### Progress with Custom Max

```jsx
<Progress value={3} max={10} />
```

#### Progress Variants

```jsx
<Progress value={25} variant="default" />
<Progress value={50} variant="success" />
<Progress value={75} variant="warning" />
<Progress value={90} variant="error" />
```

## Select

The Select component allows users to select an option from a dropdown list.

### Import

```jsx
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator
} from "../components/ui/select";
```

### Component Structure

- `Select`: The root container component
- `SelectGroup`: Groups related select items
- `SelectValue`: Displays the selected value
- `SelectTrigger`: The button that opens the select dropdown
- `SelectContent`: The dropdown content container
- `SelectLabel`: A label for a group of items
- `SelectItem`: An individual select option
- `SelectSeparator`: A visual separator between items

### Common Props

#### Select
- `children`: Select content
- `defaultValue`: Default selected value
- `value`: Controlled selected value
- `onValueChange`: Function called when selection changes
- `open`: Boolean to control open state
- `onOpenChange`: Function called when open state changes
- `disabled`: Boolean to disable the select
- `required`: Boolean indicating if selection is required
- `name`: Select name

#### SelectTrigger
- `className`: Additional CSS classes
- `children`: Trigger content
- `asChild`: Boolean to merge props onto child
- `disabled`: Boolean to disable the trigger

#### SelectContent
- `className`: Additional CSS classes
- `children`: Content children
- `position`: Position strategy (popper, item-aligned)
- `side`: Preferred side (top, right, bottom, left)
- `sideOffset`: Offset from side
- `align`: Alignment (start, center, end)
- `alignOffset`: Offset from alignment
- `avoidCollisions`: Boolean to avoid collisions
- `forceMount`: Boolean to force mounting

#### SelectItem
- `className`: Additional CSS classes
- `children`: Item content
- `value`: Item value
- `disabled`: Boolean to disable the item
- `textValue`: Alternative text value for typeahead
- `asChild`: Boolean to merge props onto child

### Examples

#### Basic Select

```jsx
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
  </SelectContent>
</Select>
```

#### Select with Groups and Labels

```jsx
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a category" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruits</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Vegetables</SelectLabel>
      <SelectItem value="carrot">Carrot</SelectItem>
      <SelectItem value="potato">Potato</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

## Skeleton

The Skeleton component is used to display a placeholder while content is loading.

### Import

```jsx
import { Skeleton } from "../components/ui/skeleton";
```

### Common Props

- `className`: Additional CSS classes
- `style`: Inline styles
- `width`: Width of the skeleton
- `height`: Height of the skeleton
- `id`: Skeleton ID
- `role`: ARIA role
- `aria-label`: Accessible label

### Examples

#### Basic Skeleton

```jsx
<Skeleton className="h-4 w-[250px]" />
```

#### Avatar Skeleton

```jsx
<Skeleton className="h-12 w-12 rounded-full" />
```

#### Card Skeleton

```jsx
<div className="space-y-2">
  <Skeleton className="h-10 w-[80px]" />
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
</div>
```

## Switch

The Switch component is used for toggling between enabled and disabled states.

### Import

```jsx
import { Switch } from "../components/ui/switch";
```

### Common Props

- `className`: Additional CSS classes
- `checked`: Boolean for controlled checked state
- `defaultChecked`: Boolean for uncontrolled initial checked state
- `onCheckedChange`: Function called when checked state changes
- `disabled`: Boolean to disable the switch
- `required`: Boolean indicating if switch is required
- `name`: Switch name
- `value`: Switch value
- `id`: Switch ID

### Examples

#### Basic Switch

```jsx
<Switch />
```

#### Controlled Switch

```jsx
import { useState } from "react";

function ControlledSwitch() {
  const [checked, setChecked] = useState(false);
  return (
    <Switch
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}
```

#### Switch with Label

```jsx
import { Label } from "../components/ui/label";

function SwitchWithLabel() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  );
}
```

## Tooltip

The Tooltip component displays additional information when hovering over an element.

### Import

```jsx
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "../components/ui/tooltip";
```

### Component Structure

- `TooltipProvider`: Provider component for tooltips
- `Tooltip`: The root container component
- `TooltipTrigger`: The element that triggers the tooltip
- `TooltipContent`: The tooltip content container

### Common Props

#### TooltipProvider
- `children`: Provider content
- `delayDuration`: Default delay duration in milliseconds
- `skipDelayDuration`: Skip delay duration in milliseconds
- `disableHoverableContent`: Boolean to disable hoverable content

#### Tooltip
- `children`: Tooltip content
- `defaultOpen`: Boolean for uncontrolled initial open state
- `open`: Boolean for controlled open state
- `onOpenChange`: Function called when open state changes
- `delayDuration`: Delay duration in milliseconds

#### TooltipTrigger
- `className`: Additional CSS classes
- `children`: Trigger content
- `asChild`: Boolean to merge props onto child

#### TooltipContent
- `className`: Additional CSS classes
- `sideOffset`: Offset from side

### Examples

#### Basic Tooltip

```jsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <Button variant="outline" size="icon">
        <InfoIcon className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Add to library</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Tooltip with Custom Delay

```jsx
<TooltipProvider delayDuration={500}>
  <Tooltip>
    <TooltipTrigger>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This tooltip appears after 500ms</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

#### Tooltip with Custom Styling

```jsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent className="bg-primary text-primary-foreground">
      <p>Custom styled tooltip</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```