/**
 * Services Index
 * Export all API functions, types, hooks, and utilities
 */

// Core API functions and types
export * from "./api";
export * from "./types";

// React hooks for API consumption
export * from "./useApi";

// Client utilities
export * from "./clientUtils";

// API testing utility
export { default as apiTester } from "./apiTester";

// Re-export default API object
export { default as API } from "./api";
