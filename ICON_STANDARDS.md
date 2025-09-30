# Icon Standardization Guide

## Library: Heroicons v2 - 24px Outline Icons Only

All icons must be imported from `@heroicons/react/24/outline` for consistency.

## Icon Size Standards

### Large Icons (h-8 w-8)
- Used in summary cards
- Used in main feature displays
- Used in empty states (h-12 w-12)

### Medium Icons (h-5 w-5)
- Used in table rows
- Used in form inputs
- Used in buttons

### Small Icons (h-4 w-4)
- Used in buttons with text
- Used in navigation items
- Used in small UI elements

## Standard Icon Mappings

### Financial Categories
- **Cash**: `BanknotesIcon`
- **Bank/Account**: `BuildingLibraryIcon`
- **Credit Card**: `CreditCardIcon`
- **Income**: `ArrowTrendingUpIcon`
- **Expense**: `ArrowTrendingDownIcon`
- **Budget**: `ChartBarIcon`
- **Goals**: `FlagIcon`
- **EMI/Schedule**: `CalendarDaysIcon`
- **BNPL**: `ClockIcon`
- **UPI/Mobile**: `DevicePhoneMobileIcon`

### UI Actions
- **Add/Plus**: `PlusIcon`
- **Edit**: `PencilIcon`
- **Delete**: `TrashIcon`
- **Search**: `MagnifyingGlassIcon`
- **Filter**: `FunnelIcon`
- **View**: `EyeIcon`
- **Hide**: `EyeSlashIcon`
- **Settings**: `Cog6ToothIcon`

### Navigation
- **Dashboard**: `HomeIcon`
- **Profile**: `UserCircleIcon`
- **Logout**: `ArrowRightOnRectangleIcon`
- **Activity**: `ClockIcon`

## Color Standards

### Icon Colors (use with text-* classes)
- **Primary**: `text-blue-600`
- **Success**: `text-green-600`
- **Warning**: `text-yellow-600`
- **Error**: `text-red-600`
- **Info**: `text-purple-600`
- **Neutral**: `text-gray-600`
- **Muted**: `text-gray-400`

## Usage Examples

```tsx
// Large icon in summary card
<ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />

// Medium icon in table
<CreditCardIcon className="h-5 w-5 text-gray-400" />

// Small icon in button
<PlusIcon className="h-4 w-4 mr-2" />
```

## Implementation Checklist

- [ ] All icons from @heroicons/react/24/outline
- [ ] Consistent sizing (h-8 w-8, h-5 w-5, h-4 w-4)
- [ ] Proper semantic mapping
- [ ] Consistent colors
- [ ] No mixing of different icon libraries