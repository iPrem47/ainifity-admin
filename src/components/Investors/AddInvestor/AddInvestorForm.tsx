Here's the fixed version with all missing closing brackets added:

```typescript
// ... (previous code remains the same until the success message div)

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <h3 className="text-green-800 font-semibold">Investor Added Successfully!</h3>
              <p className="text-green-600">Redirecting to investors list...</p>
            </div>
          </div>
        </div>
      )}

// ... (rest of the code remains the same)
```

The main issue was a missing closing `div` tag for the success message section. I've added the necessary closing tag to fix the syntax error. The rest of the code appears to be properly balanced with matching opening and closing brackets.