# SpatialOS Boot Robustness & Reliability Guide

## 🎯 ULTRATHINK: System Reliability Architecture

This document outlines the boot process, potential failure points, and robustness improvements for Terra OS / SpatialOS.

---

## 📊 Current Boot Flow Analysis

```
┌─────────────────┐
│   main.jsx      │  React.StrictMode wrapper
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   App.jsx       │  Boot sequence controller
└────────┬────────┘
         │
         ├─► BootSequence (cosmetic delay)
         │
         └─► SpatialWorkspace
             │
             ├─► ReactFlowProvider
             ├─► usePeripherals (localStorage)
             ├─► usePeripheralCables (auto-wiring)
             ├─► Initial nodes/edges setup
             └─► Component tree render
```

---

## 🔴 Critical Failure Points

### 1. **LocalStorage Failures**
**Location:** `usePeripherals.ts:9`
**Risk:** High
**Impact:** Lost peripheral state, crashes on privacy mode

**Failure Scenarios:**
- Privacy/incognito mode blocks localStorage
- Quota exceeded (rare but possible)
- Corrupted JSON data
- Browser extensions blocking access

**Current Code:**
```typescript
const saved = localStorage.getItem(STORAGE_KEY);
return saved ? JSON.parse(saved) : {};
```

**Issues:**
- No try/catch on JSON.parse()
- No validation of parsed data
- Silent failure could crash app

---

### 2. **BootSequence: Cosmetic Only**
**Location:** `BootSequence.jsx:17-34`
**Risk:** Medium
**Impact:** Boot completes even if critical systems fail

**Current Behavior:**
- Shows fake "loading" logs
- Doesn't validate ReactFlow loaded
- Doesn't check peripheral system
- Doesn't verify utilities available
- Pure aesthetic, no actual health checks

**What It SHOULD Do:**
- Verify ReactFlow initialization
- Validate peripheral data loaded
- Check localStorage availability
- Confirm utility registry accessible
- Test critical component mounting

---

### 3. **Missing Error Boundaries**
**Location:** Nowhere (that's the problem)
**Risk:** Critical
**Impact:** Single component error crashes entire app

**React Errors That Kill the App:**
- GraphViewNode canvas errors
- FlipClock/Pomodoro render failures
- ReactFlow layout errors
- Invalid node/edge data

**Result:** White screen, no recovery

---

### 4. **Large Initial State Without Validation**
**Location:** `App.jsx:543-728`
**Risk:** Medium
**Impact:** Invalid node data crashes ReactFlow

**Issues:**
- 40+ nodes created in one useEffect
- No validation of data structure
- Circular references possible
- Missing required fields silently fail
- parentNode references could be invalid

**Example Failure:**
```jsx
{ id: 'child', parentNode: 'typo-parent' } // Parent doesn't exist → crash
```

---

### 5. **Peripheral System Dependencies**
**Location:** `usePeripheralCables.js:16`
**Risk:** Medium
**Impact:** Auto-wiring fails silently

**Current Code:**
```javascript
const deviceNode = nodes.find(n => n.type === 'device-peripherals');
if (!deviceNode) return; // Silent failure
```

**Issues:**
- Assumes device node exists
- No feedback if device missing
- Cables won't appear, user confused
- No logging or error handling

---

### 6. **Missing Data Files**
**Location:** `data/peripherals.ts`
**Risk:** Low (import errors caught by bundler)
**Impact:** Build fails, not runtime fail

**Still Worth Checking:**
- Empty arrays would silently break UX
- No runtime validation of data shape

---

### 7. **Utility Registry Mismatches**
**Location:** `stores/utilityStore.js` vs peripheral utilityIds
**Risk:** Medium
**Impact:** Agents can't invoke missing utilities

**Example:**
```javascript
// Peripheral references 'capture-photo' but utility doesn't exist
{ utilityId: 'capture-photo' } // Not in utilities array!
```

**Result:** getUtility() returns undefined → crash when invoked

---

## ✅ Robustness Improvements

### Phase 1: Critical Safety (DO NOW)

#### 1.1 Error Boundary Component
```jsx
// components/ErrorBoundary.jsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SpatialOS Error:', error, errorInfo);
    // Could send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>Terra OS Encountered an Error</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload System
          </button>
          <button onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}>
            Factory Reset
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Wrap in App.jsx:**
```jsx
<ErrorBoundary>
  <SpatialWorkspace />
</ErrorBoundary>
```

---

#### 1.2 Safe LocalStorage Wrapper
```typescript
// utils/safeStorage.ts
export const safeStorage = {
  get(key: string, fallback: any = null) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item);
    } catch (error) {
      console.warn(`LocalStorage read failed for ${key}:`, error);
      return fallback;
    }
  },

  set(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`LocalStorage write failed for ${key}:`, error);
      return false;
    }
  },

  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
};
```

**Update usePeripherals.ts:**
```typescript
const [portState, setPortState] = useState(() => {
  return safeStorage.get(STORAGE_KEY, {});
});

useEffect(() => {
  safeStorage.set(STORAGE_KEY, portState);
}, [portState]);
```

---

#### 1.3 Real Boot Validation
```jsx
// BootSequence.jsx - Enhanced
const bootChecks = [
  {
    name: "MEMORY MODULES",
    check: () => safeStorage.isAvailable()
  },
  {
    name: "SPATIAL ENGINE",
    check: () => typeof window !== 'undefined' && window.ReactFlow !== undefined
  },
  {
    name: "PERIPHERAL REGISTRY",
    check: () => peripherals.length > 0 && macbookPorts.length > 0
  },
  {
    name: "UTILITY REGISTRY",
    check: () => utilities.length > 0
  }
];

// Run real checks, show FAIL if check fails
const [failures, setFailures] = useState([]);

useEffect(() => {
  const failed = bootChecks.filter(check => !check.check());
  setFailures(failed);

  if (failed.length > 0) {
    // Don't call onComplete, show error state
  } else {
    setTimeout(onComplete, 1500);
  }
}, []);
```

---

### Phase 2: Graceful Degradation (NEXT)

#### 2.1 Component-Level Error Boundaries
Wrap each district and major widget:
```jsx
<ErrorBoundary fallback={<DistrictErrorCard />}>
  <DistrictNode {...props} />
</ErrorBoundary>
```

#### 2.2 Node Validation Schema
```typescript
// utils/nodeValidator.ts
export const validateNode = (node) => {
  const required = ['id', 'type', 'position'];
  const missing = required.filter(field => !(field in node));

  if (missing.length > 0) {
    console.error(`Invalid node ${node.id}: missing ${missing}`);
    return false;
  }

  if (node.parentNode) {
    // Will be validated after all nodes loaded
  }

  return true;
};

export const validateNodeTree = (nodes) => {
  const nodeIds = new Set(nodes.map(n => n.id));

  const orphans = nodes.filter(n =>
    n.parentNode && !nodeIds.has(n.parentNode)
  );

  if (orphans.length > 0) {
    console.error('Orphaned nodes:', orphans.map(n => n.id));
  }

  return orphans;
};
```

#### 2.3 Utility Registry Validator
```javascript
// Run on boot
export const validateUtilityReferences = () => {
  const utilityIds = new Set(utilities.map(u => u.id));
  const referencedIds = new Set(
    peripherals.map(p => p.utilityId).filter(Boolean)
  );

  const missing = [...referencedIds].filter(id => !utilityIds.has(id));

  if (missing.length > 0) {
    console.error('Missing utilities:', missing);
  }

  return missing;
};
```

---

### Phase 3: Developer Experience (LATER)

#### 3.1 Boot Diagnostic Mode
```jsx
// Press 'D' during boot to see real diagnostics
const [diagnosticMode, setDiagnosticMode] = useState(false);

useEffect(() => {
  const handler = (e) => {
    if (e.key === 'd' || e.key === 'D') {
      setDiagnosticMode(true);
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

#### 3.2 System Health Monitor
```jsx
// components/HealthMonitor.jsx
export const HealthMonitor = () => {
  const [health, setHealth] = useState({
    localStorage: true,
    reactFlow: true,
    peripherals: true,
    nodes: { count: 0, valid: 0 }
  });

  // Run periodic health checks
  useEffect(() => {
    const interval = setInterval(() => {
      setHealth({
        localStorage: safeStorage.isAvailable(),
        reactFlow: true, // Check ReactFlow is responsive
        peripherals: peripherals.length > 0,
        nodes: {
          count: document.querySelectorAll('.react-flow__node').length,
          valid: true
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return <HealthIndicator health={health} />;
};
```

#### 3.3 Safe Mode Boot
```jsx
// If localStorage corrupted or too many errors, boot in safe mode
const [safeMode, setSafeMode] = useState(() => {
  const errorCount = safeStorage.get('boot_error_count', 0);
  return errorCount > 3;
});

if (safeMode) {
  // Load minimal config: just districts, no peripherals, basic nodes
  return <SafeModeWorkspace onReset={() => {
    safeStorage.set('boot_error_count', 0);
    window.location.reload();
  }} />;
}
```

---

## 🎨 Neurodivergent-Friendly Error UX

### Visual Error States
Instead of scary stack traces, show:
- **Breathing pulse animation** on error boundary
- **Color-coded severity**: Yellow (warning), Red (critical)
- **Clear recovery actions**: "Reset this component" vs "Reload entire system"
- **Progress indicators**: "Attempting recovery... 1/3"

### Error Messages
- **Plain language**: "The graph visualization stopped working" not "ReferenceError in GraphViewNode.jsx:42"
- **Suggested actions**: "This usually fixes itself if you refresh the page"
- **Emoji indicators**: ⚠️ Warning, 🔴 Critical, ✅ Recovered

---

## 📋 Implementation Checklist

### Must Have (Phase 1)
- [ ] Add top-level ErrorBoundary in App.jsx
- [ ] Implement safeStorage wrapper
- [ ] Replace localStorage calls in usePeripherals
- [ ] Add real validation to BootSequence
- [ ] Show boot failures with recovery options

### Should Have (Phase 2)
- [ ] Component-level error boundaries for districts
- [ ] Node validation before setNodes
- [ ] Utility registry validation
- [ ] Peripheral cable error handling
- [ ] Graceful degradation for missing device node

### Nice to Have (Phase 3)
- [ ] Diagnostic boot mode (Press D)
- [ ] System health monitor widget
- [ ] Safe mode boot after repeated failures
- [ ] Error telemetry (local only, privacy-first)
- [ ] Recovery suggestions based on error type

---

## 🚀 Quick Start: Adding Basic Robustness NOW

**5-Minute Implementation:**

1. Create `src/components/ErrorBoundary.jsx` (see 1.1 above)
2. Wrap `<SpatialWorkspace />` in App.jsx with `<ErrorBoundary>`
3. Create `src/utils/safeStorage.ts` (see 1.2 above)
4. Update `usePeripherals.ts` imports and usage

**Result:** App won't crash from localStorage or render errors

---

## 💡 Testing Failure Scenarios

### Simulate Failures
```javascript
// In browser console:

// 1. Corrupt localStorage
localStorage.setItem('terra_peripheral_state', 'invalid json{{{');

// 2. Block localStorage
Object.defineProperty(window, 'localStorage', { value: null });

// 3. Create orphan node
// In App.jsx, add: { id: 'test', parentNode: 'fake-parent-id' }

// 4. Remove device node
// Comment out device-hub node, watch cables fail

// 5. Trigger React error
// Add: { id: 'bad', data: { cyclical: node } } // Circular reference
```

---

## 🎯 Success Metrics

**Boot Robustness Score:**
- ✅ LocalStorage failures don't crash app
- ✅ Invalid node data shows error, not white screen
- ✅ Missing peripherals degrade gracefully
- ✅ Boot validates critical systems
- ✅ User can recover from errors without terminal

**Target:** 5/5 ✅ before production use

---

## 📚 Additional Resources

- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- LocalStorage Best Practices: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
- ReactFlow Error Handling: Check for null nodes before render
- Defensive Programming: Validate inputs, fail gracefully

---

**Last Updated:** 2025-12-22
**Author:** Claude Sonnet 4.5 (Ultrathink Edition)
**Status:** Living Document - Update as system evolves
