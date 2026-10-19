-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 19, 2026 at 09:28 AM
-- Server version: 8.0.46-0ubuntu0.24.04.4
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `client_edits`
--

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` bigint UNSIGNED NOT NULL,
  `edit_id` bigint UNSIGNED NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attachments`
--

INSERT INTO `attachments` (`id`, `edit_id`, `original_name`, `file_path`, `mime_type`, `size`, `created_at`, `updated_at`) VALUES
(9, 14, 'Hussein-Azzam-Week-5-report.docx', 'attachments/MKP9DMQKbPlsJzJkv41dBx6M7ECmIgTexpHoKFxH.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 28449, '2026-10-18 12:37:26', '2026-10-18 12:37:26'),
(10, 13, 'Hussein-Azzam-Week-8-report.pdf', 'attachments/SZa9iJzAaPNGGDG8pEsjFuj1jv0pBDi0xyC40nbz.pdf', 'application/pdf', 52570, '2026-10-18 12:37:35', '2026-10-18 12:37:35'),
(11, 10, 'Hussein-Azzam-Week-10-report.docx', 'attachments/YwITFDMHu1L1kPTsDbgQEWhzSt2bJovxzR0PGYTV.zip', 'application/zip', 29546, '2026-10-18 12:37:44', '2026-10-18 12:37:44'),
(12, 14, 'Hussein-Azzam-Week-5-report.pdf', 'attachments/2xaLoNX4Pn6uZKW1ycwQOZ9jBE4l2bzFHf3WV7m1.pdf', 'application/pdf', 43030, '2026-10-19 05:19:35', '2026-10-19 05:19:35'),
(13, 14, 'Hussein-Azzam-Week-6-report.pdf', 'attachments/Tiap03gA5aowrW4p4v7RsBbwepe9f2yqbzNypAzd.pdf', 'application/pdf', 44290, '2026-10-19 05:19:56', '2026-10-19 05:19:56');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_contact_followup` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `name`, `phone`, `email`, `company_name`, `service`, `last_contact_followup`, `created_at`, `updated_at`) VALUES
(1, 'jlk', 'sfa', 'saf@rsgafr', 'yyugu', 'ijhuygu', '2026-10-13', '2026-10-13 07:49:03', '2026-10-13 07:49:03'),
(5, 'Dup', '123', 'test@example.com', 'Dup Co', 'X', NULL, '2026-10-15 17:05:48', '2026-10-15 17:05:48'),
(6, 'A', '1', 'a_1792095538@a.co', 'A', 'S', NULL, '2026-10-15 17:18:58', '2026-10-15 17:18:58'),
(9, 'Acme Corp', 'kj', 'contact_1792099250@acme.test', 'Acme Corporation', 'Full-Stack Development', '2026-10-16', '2026-10-15 18:20:50', '2026-10-18 12:57:27');

-- --------------------------------------------------------

--
-- Table structure for table `edits`
--

CREATE TABLE `edits` (
  `id` bigint UNSIGNED NOT NULL,
  `client_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `due_date` date DEFAULT NULL,
  `priority` enum('High','Medium','Low') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Medium',
  `payment` decimal(10,2) DEFAULT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('pending','approved','in_progress','done','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `edits`
--

INSERT INTO `edits` (`id`, `client_id`, `title`, `description`, `due_date`, `priority`, `payment`, `is_paid`, `status`, `created_at`, `updated_at`) VALUES
(9, 9, 'khgg', 'hhjg', '2026-10-28', 'Medium', 56.00, 1, 'in_progress', '2026-10-18 11:36:43', '2026-10-18 13:10:32'),
(10, 5, 'bhg', 'jhghf', NULL, 'High', 15.00, 0, 'pending', '2026-10-18 12:06:24', '2026-10-18 13:10:43'),
(11, 1, 'jhgjh', 'hfdgs', '2026-10-29', 'Low', NULL, 0, 'done', '2026-10-18 12:07:57', '2026-10-18 12:07:57'),
(12, 5, 'hkbh', 'fsawrx', NULL, 'Low', NULL, 0, 'done', '2026-10-18 12:08:43', '2026-10-18 12:08:43'),
(13, 6, 'njhvc', 'l;kjh', '2026-10-30', 'Medium', NULL, 0, 'cancelled', '2026-10-18 12:09:34', '2026-10-18 12:09:34'),
(14, 9, 'jyftdr', 'bhjvhcg', '2026-10-29', 'High', NULL, 0, 'approved', '2026-10-18 12:10:23', '2026-10-18 12:10:23');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '1_create_clients_table', 1),
(5, '2026_10_13_080644_create_personal_access_tokens_table', 1),
(6, '2_create_edits_table', 1),
(7, '3_create_attachments_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(3, 'App\\Models\\User', 3, 'api', 'd579ca2a9a8b5852247083cffffc54a851a6d6df2ea8580d290314d938b02003', '[\"*\"]', NULL, NULL, '2026-10-15 16:55:01', '2026-10-15 16:55:01'),
(6, 'App\\Models\\User', 6, 'api', '11113cef226c30acfc47b7216ebdeb621db96063a3435a4f27dcd5713237eb46', '[\"*\"]', NULL, NULL, '2026-10-15 17:10:41', '2026-10-15 17:10:41'),
(9, 'App\\Models\\User', 7, 'api', '6756a63dc4645db890c62f3feb86d355cdf4e6c5538ef78c6099096f748ad3cf', '[\"*\"]', '2026-10-15 17:18:58', NULL, '2026-10-15 17:18:46', '2026-10-15 17:18:58'),
(10, 'App\\Models\\User', 8, 'api', '5bb53b765bdac309cb46aba4fbe68613e76c632cc8ce264fa73fc4d2d7a2417e', '[\"*\"]', NULL, NULL, '2026-10-15 17:36:03', '2026-10-15 17:36:03'),
(13, 'App\\Models\\User', 1, 'api', '9053aa0e581104eb0a1977538a269c87c66221398459b9c9dc4231cd5e4d5e8a', '[\"*\"]', '2026-10-15 18:14:59', NULL, '2026-10-15 18:14:58', '2026-10-15 18:14:59'),
(14, 'App\\Models\\User', 9, 'api', '066e0d9a66c3f86f176514e1d4c9b090befe025cbea1970d1418245a6ed6b352', '[\"*\"]', NULL, NULL, '2026-10-15 18:20:03', '2026-10-15 18:20:03'),
(16, 'App\\Models\\User', 1, 'api', '57e5d0232064b0f5133f8c1e56fc0a4623292197d4899c9e2af41b79064f90f6', '[\"*\"]', '2026-10-15 18:25:38', NULL, '2026-10-15 18:20:25', '2026-10-15 18:25:38'),
(19, 'App\\Models\\User', 1, 'api', '520ca2e8639ce8241cf773ece3ede11232a3297470ed3b4acb6a04c385282f00', '[\"*\"]', '2026-10-19 05:23:00', NULL, '2026-10-19 05:16:38', '2026-10-19 05:23:00');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'husyn', 'test@example.com', NULL, '$2y$12$p6oSaQIGgjhKHn0997rAx.GkB0clIuPQtt8tZDtugq7AAxlD0t9Nu', NULL, '2026-10-13 07:48:20', '2026-10-13 07:48:20'),
(2, 'Smoke User', 'smoke_1792093924@example.com', NULL, '$2y$12$UFh5FgzFoqqAI2or4SUPMOYeiYh6nGaWyQZUkWQ5XjA8VcOsA06UO', NULL, '2026-10-15 16:52:05', '2026-10-15 16:52:05'),
(3, 'X', 'x_1792094101@ex.com', NULL, '$2y$12$ruGOK3AwL2DyHyB1AKI/pOHODqJEGimQlocf98Ienv4aWqoutLpzy', NULL, '2026-10-15 16:55:01', '2026-10-15 16:55:01'),
(4, 'Diag', 'diag_1792094307@example.com', NULL, '$2y$12$4OB4vbiwCMkDNSpg3vfqW.d7o8wAqFZFAxKBuD6Iz5WUg6UX7P9Ly', NULL, '2026-10-15 16:58:27', '2026-10-15 16:58:27'),
(5, 'Test User', 't_1792094712@example.com', NULL, '$2y$12$cLlMX6VzwF4me/yhryv7W.hU/EdVBVxGKN2eNfWm2JPunKz5IDrRi', NULL, '2026-10-15 17:05:12', '2026-10-15 17:05:12'),
(6, 'Test User', 'test_1792095041@example.com', NULL, '$2y$12$sDtYkDC6XRAg5oSlTWg0juQIdXknQWQyNuklOwXQ.BS9bzPYKfi8.', NULL, '2026-10-15 17:10:41', '2026-10-15 17:10:41'),
(7, 'T', 't_1792095525@ex.com', NULL, '$2y$12$QLjkvFzVYh3glondDovdiee.sggp.Gs7ND6VSJC8tchhjmnPxDpgK', NULL, '2026-10-15 17:18:46', '2026-10-15 17:18:46'),
(8, 'Test User', 'test_1792096562@example.com', NULL, '$2y$12$Iki./t/SlwaNKjKh0Wi5xOaHUrlmSAd20tFPIVbg6uEWRzZyzdzD6', NULL, '2026-10-15 17:36:03', '2026-10-15 17:36:03'),
(9, 'Test User', 'test_1792099203@example.com', NULL, '$2y$12$3TKEHN6iDH3iEPn5/EDUrexKPNN4PBm8o/zhtQJ2W94DgZBl/MKj2', NULL, '2026-10-15 18:20:03', '2026-10-15 18:20:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attachments_edit_id_foreign` (`edit_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clients_email_unique` (`email`);

--
-- Indexes for table `edits`
--
ALTER TABLE `edits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `edits_client_id_foreign` (`client_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `edits`
--
ALTER TABLE `edits`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `attachments_edit_id_foreign` FOREIGN KEY (`edit_id`) REFERENCES `edits` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `edits`
--
ALTER TABLE `edits`
  ADD CONSTRAINT `edits_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
