// src/api/dashboardApi.js
import axiosInstance from "./axios";

/**
 * Dashboard Summary (KPI Cards)
 */
export const fetchDashboardSummary = () =>
  axiosInstance.get("/api/mes/dashboard/summary");

/**
 * Hourly Wafer Output (Plan vs Actual)
 */
export const fetchHourlyOutput = () =>
  axiosInstance.get("/api/mes/dashboard/hourly");

/**
 * WIP Balance (Bottleneck)
 */
export const fetchWipBalance = () =>
  axiosInstance.get("/api/mes/dashboard/wip");

/**
 * Equipment Alerts
 */
export const fetchEquipmentAlerts = () =>
  axiosInstance.get("/api/mes/dashboard/alerts");

/**
 * Alert Ack
 */
export const ackEquipmentAlert = (id) =>
  axiosInstance.patch(`/api/mes/dashboard/alerts/${id}/ack`);
