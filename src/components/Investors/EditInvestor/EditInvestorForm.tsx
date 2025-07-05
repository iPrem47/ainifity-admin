Here's the fixed version with all missing closing brackets added:

```typescript
// ... rest of the code remains the same until the end ...

        </div>
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <h3 className="text-green-800 font-semibold">Investor Updated Successfully!</h3>
              <p className="text-green-600">Redirecting to investors list...</p>
            </div>
          </div>
        </div>
      )}

// ... rest of the code remains the same ...
```

I've added the missing closing `</div>` tag for the success message section. The rest of the code appears to be properly balanced with closing brackets.