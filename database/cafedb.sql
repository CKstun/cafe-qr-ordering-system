-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 13, 2026 at 05:40 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cafedb`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`, `created_at`) VALUES
(50, 'All-day Breakfast', '2026-09-06 10:47:42'),
(51, 'Rice Meals', '2026-09-06 10:47:42'),
(52, 'Snacks & Appetizers', '2026-09-06 10:47:42'),
(53, 'Sandwich & Burger', '2026-09-06 10:47:42'),
(54, 'Pasta', '2026-09-06 10:47:42'),
(55, 'Samyang Buldak', '2026-09-06 10:47:42'),
(56, 'Desserts', '2026-09-06 10:47:42'),
(57, 'Non-Espresso', '2026-09-06 10:47:42'),
(58, 'Refreshers', '2026-09-06 10:47:42'),
(59, 'Hot Blend', '2026-09-06 10:47:42'),
(60, 'Americano Series', '2026-09-06 10:47:42'),
(61, 'Classic Blend', '2026-09-06 10:47:42'),
(62, 'Signature Blend', '2026-09-06 10:47:42'),
(63, 'Baked Mac & Palabok Party Tray', '2026-09-06 10:47:42'),
(65, 'Frappe', '2026-09-07 13:13:51');

-- --------------------------------------------------------

--
-- Table structure for table `customization_options`
--

CREATE TABLE `customization_options` (
  `customization_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `option_name` varchar(100) NOT NULL,
  `option_group` varchar(100) NOT NULL DEFAULT 'General',
  `option_type` enum('size','sugar','topping','add-on','other') NOT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `is_available` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customization_options`
--

INSERT INTO `customization_options` (`customization_id`, `menu_item_id`, `option_name`, `option_group`, `option_type`, `price`, `is_available`) VALUES
(1, 219, '16oz Regular', 'Drink Variant', 'other', 99.00, 1),
(2, 219, '22oz Regular', 'Drink Variant', 'other', 199.00, 1),
(3, 219, '16oz Sub-oat', 'Drink Variant', 'other', 139.00, 1),
(4, 219, '22oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(5, 220, '16oz Regular', 'Drink Variant', 'other', 199.00, 1),
(6, 220, '22oz Regular', 'Drink Variant', 'other', 129.00, 1),
(7, 220, '16oz Sub-oat', 'Drink Variant', 'other', 149.00, 1),
(8, 220, '22oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(9, 221, '16oz Regular', 'Drink Variant', 'other', 199.00, 1),
(10, 221, '22oz Regular', 'Drink Variant', 'other', 139.00, 1),
(11, 221, '16oz Sub-oat', 'Drink Variant', 'other', 149.00, 1),
(12, 221, '22oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(13, 222, '16oz Regular', 'Drink Variant', 'other', 199.00, 1),
(14, 222, '22oz Regular', 'Drink Variant', 'other', 139.00, 1),
(15, 222, '16oz Sub-oat', 'Drink Variant', 'other', 149.00, 1),
(16, 222, '22oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(17, 223, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(18, 223, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(19, 223, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(20, 223, '22oz Sub-oat', 'Drink Variant', 'other', 179.00, 1),
(21, 224, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(22, 224, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(23, 224, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(24, 224, '22oz Sub-oat', 'Drink Variant', 'other', 179.00, 1),
(25, 225, '16oz Regular', 'Drink Variant', 'other', 139.00, 1),
(26, 225, '22oz Regular', 'Drink Variant', 'other', 159.00, 1),
(27, 225, '16oz Sub-oat', 'Drink Variant', 'other', 169.00, 1),
(28, 225, '22oz Sub-oat', 'Drink Variant', 'other', 179.00, 1),
(29, 226, '16oz Regular', 'Drink Variant', 'other', 139.00, 1),
(30, 226, '22oz Regular', 'Drink Variant', 'other', 159.00, 1),
(31, 226, '16oz Sub-oat', 'Drink Variant', 'other', 169.00, 1),
(32, 226, '22oz Sub-oat', 'Drink Variant', 'other', 179.00, 1),
(33, 227, '16oz Regular', 'Drink Variant', 'other', 149.00, 1),
(34, 227, '22oz Regular', 'Drink Variant', 'other', 169.00, 1),
(35, 227, '16oz Sub-oat', 'Drink Variant', 'other', 179.00, 1),
(36, 227, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(37, 228, '16oz Regular', 'Drink Variant', 'other', 149.00, 1),
(38, 228, '22oz Regular', 'Drink Variant', 'other', 169.00, 1),
(39, 228, '16oz Sub-oat', 'Drink Variant', 'other', 179.00, 1),
(40, 228, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(41, 229, '16oz Regular', 'Drink Variant', 'other', 149.00, 1),
(42, 229, '22oz Regular', 'Drink Variant', 'other', 169.00, 1),
(43, 229, '16oz Sub-oat', 'Drink Variant', 'other', 179.00, 1),
(44, 229, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(68, 230, '16oz', 'Size', 'size', 95.00, 1),
(69, 230, '22oz', 'Size', 'size', 140.00, 1),
(73, 231, '16oz', 'Size', 'size', 80.00, 1),
(76, 231, 'Lychee', 'Flavor', 'other', 0.00, 1),
(79, 231, 'Mango', 'Flavor', 'other', 0.00, 1),
(82, 231, 'Lemon', 'Flavor', 'other', 0.00, 1),
(85, 231, 'Green Apple', 'Flavor', 'other', 0.00, 1),
(88, 233, '12oz Regular', 'Drink Variant', 'other', 90.00, 1),
(89, 234, '12oz Regular', 'Drink Variant', 'other', 119.00, 1),
(90, 234, '12oz Sub-oat', 'Drink Variant', 'other', 139.00, 1),
(91, 235, '12oz Regular', 'Drink Variant', 'other', 119.00, 1),
(92, 235, '12oz Sub-oat', 'Drink Variant', 'other', 139.00, 1),
(93, 236, '12oz Regular', 'Drink Variant', 'other', 129.00, 1),
(94, 236, '12oz Sub-oat', 'Drink Variant', 'other', 149.00, 1),
(95, 237, '12oz Regular', 'Drink Variant', 'other', 129.00, 1),
(96, 237, '12oz Sub-oat', 'Drink Variant', 'other', 149.00, 1),
(97, 239, '12oz Regular', 'Drink Variant', 'other', 149.00, 1),
(98, 239, '12oz Sub-oat', 'Drink Variant', 'other', 169.00, 1),
(99, 240, '12oz Regular', 'Drink Variant', 'other', 149.00, 1),
(100, 240, '12oz Sub-oat', 'Drink Variant', 'other', 169.00, 1),
(101, 238, 'Roasted Almond - 12oz Regular', 'Flavor / Drink Variant', 'other', 139.00, 0),
(102, 238, 'Roasted Almond - 12oz Sub-oat', 'Flavor / Drink Variant', 'other', 159.00, 0),
(103, 238, 'Caramel Macchiato - 12oz Regular', 'Flavor / Drink Variant', 'other', 139.00, 0),
(104, 238, 'Caramel Macchiato - 12oz Sub-oat', 'Flavor / Drink Variant', 'other', 159.00, 0),
(105, 238, 'Salted Caramel - 12oz Regular', 'Flavor / Drink Variant', 'other', 139.00, 0),
(106, 238, 'Salted Caramel - 12oz Sub-oat', 'Flavor / Drink Variant', 'other', 159.00, 0),
(107, 238, 'Mocha - 12oz Regular', 'Flavor / Drink Variant', 'other', 139.00, 0),
(108, 238, 'Mocha - 12oz Sub-oat', 'Flavor / Drink Variant', 'other', 159.00, 0),
(109, 238, 'Hazelnut - 12oz Regular', 'Flavor / Drink Variant', 'other', 139.00, 0),
(110, 238, 'Hazelnut - 12oz Sub-oat', 'Flavor / Drink Variant', 'other', 159.00, 0),
(111, 238, 'Macadamia - 12oz Regular', 'Flavor / Drink Variant', 'other', 139.00, 0),
(112, 238, 'Macadamia - 12oz Sub-oat', 'Flavor / Drink Variant', 'other', 159.00, 0),
(131, 250, '12oz', 'Size', 'size', 109.00, 1),
(132, 250, '22oz', 'Size', 'size', 119.00, 1),
(133, 251, '12oz', 'Size', 'size', 119.00, 1),
(134, 251, '22oz', 'Size', 'size', 139.00, 1),
(135, 251, 'Vanilla', 'Flavor', 'other', 0.00, 1),
(136, 251, 'Caramel', 'Flavor', 'other', 0.00, 1),
(137, 251, 'Hazelnut', 'Flavor', 'other', 0.00, 1),
(138, 251, 'Roasted Almond', 'Flavor', 'other', 0.00, 1),
(139, 251, 'Macadamia', 'Flavor', 'other', 0.00, 1),
(140, 252, '16oz Regular', 'Drink Variant', 'other', 109.00, 1),
(141, 252, '22oz Regular', 'Drink Variant', 'other', 139.00, 1),
(142, 252, '16oz Sub-oat', 'Drink Variant', 'other', 149.00, 1),
(143, 252, '22oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(144, 253, '16oz Regular', 'Drink Variant', 'other', 119.00, 1),
(145, 254, '16oz Regular', 'Drink Variant', 'other', 119.00, 1),
(146, 255, '16oz Regular', 'Drink Variant', 'other', 119.00, 1),
(147, 256, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(148, 257, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(149, 258, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(151, 253, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(152, 254, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(153, 255, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(154, 256, '22oz Regular', 'Drink Variant', 'other', 159.00, 1),
(155, 257, '22oz Regular', 'Drink Variant', 'other', 159.00, 1),
(156, 258, '22oz Regular', 'Drink Variant', 'other', 159.00, 1),
(158, 253, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(159, 254, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(160, 255, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(161, 256, '16oz Sub-oat', 'Drink Variant', 'other', 169.00, 1),
(162, 257, '16oz Sub-oat', 'Drink Variant', 'other', 169.00, 1),
(163, 258, '16oz Sub-oat', 'Drink Variant', 'other', 169.00, 1),
(165, 253, '22oz Sub-oat', 'Drink Variant', 'other', 169.00, 1),
(166, 254, '22oz Sub-oat', 'Drink Variant', 'other', 169.00, 1),
(167, 255, '22oz Sub-oat', 'Drink Variant', 'other', 169.00, 1),
(168, 256, '22oz Sub-oat', 'Drink Variant', 'other', 179.00, 1),
(169, 257, '22oz Sub-oat', 'Drink Variant', 'other', 179.00, 1),
(170, 258, '22oz Sub-oat', 'Drink Variant', 'other', 179.00, 1),
(180, 241, '16oz Regular', 'Drink Variant', 'other', 130.00, 1),
(181, 241, '22oz Regular', 'Drink Variant', 'other', 130.00, 1),
(182, 241, '16oz Sub-oat', 'Drink Variant', 'other', 160.00, 1),
(183, 241, '22oz Sub-oat', 'Drink Variant', 'other', 160.00, 1),
(187, 259, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(188, 259, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(189, 259, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(190, 259, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(191, 260, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(192, 260, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(193, 260, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(194, 260, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(195, 261, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(196, 261, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(197, 261, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(198, 261, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(199, 262, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(200, 262, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(201, 262, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(202, 262, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(203, 263, '16oz Regular', 'Drink Variant', 'other', 139.00, 1),
(204, 263, '22oz Regular', 'Drink Variant', 'other', 159.00, 1),
(205, 263, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(206, 263, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(207, 264, '16oz Regular', 'Drink Variant', 'other', 159.00, 1),
(208, 264, '22oz Regular', 'Drink Variant', 'other', 179.00, 1),
(209, 264, '16oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(210, 264, '22oz Sub-oat', 'Drink Variant', 'other', 199.00, 1),
(211, 265, '16oz Regular', 'Drink Variant', 'other', 159.00, 1),
(212, 265, '22oz Regular', 'Drink Variant', 'other', 179.00, 1),
(213, 265, '16oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(214, 265, '22oz Sub-oat', 'Drink Variant', 'other', 199.00, 1),
(215, 266, '16oz Regular', 'Drink Variant', 'other', 159.00, 1),
(216, 266, '22oz Regular', 'Drink Variant', 'other', 179.00, 1),
(217, 266, '16oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(218, 266, '22oz Sub-oat', 'Drink Variant', 'other', 199.00, 1),
(219, 267, '16oz Regular', 'Drink Variant', 'other', 159.00, 1),
(220, 267, '22oz Regular', 'Drink Variant', 'other', 179.00, 1),
(221, 267, '16oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(222, 267, '22oz Sub-oat', 'Drink Variant', 'other', 199.00, 1),
(223, 259, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(224, 260, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(225, 261, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(226, 262, '16oz Regular', 'Drink Variant', 'other', 129.00, 1),
(227, 259, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(228, 260, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(229, 261, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(230, 262, '22oz Regular', 'Drink Variant', 'other', 149.00, 1),
(231, 259, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(232, 260, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(233, 261, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(234, 262, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(235, 259, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(236, 260, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(237, 261, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(238, 262, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(254, 263, '16oz Regular', 'Drink Variant', 'other', 139.00, 1),
(255, 263, '22oz Regular', 'Drink Variant', 'other', 159.00, 1),
(256, 263, '16oz Sub-oat', 'Drink Variant', 'other', 159.00, 1),
(257, 263, '22oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(261, 264, '16oz Regular', 'Drink Variant', 'other', 159.00, 1),
(262, 264, '22oz Regular', 'Drink Variant', 'other', 179.00, 1),
(263, 264, '16oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(264, 264, '22oz Sub-oat', 'Drink Variant', 'other', 199.00, 1),
(265, 265, '16oz Regular', 'Drink Variant', 'other', 159.00, 1),
(266, 265, '22oz Regular', 'Drink Variant', 'other', 179.00, 1),
(267, 265, '16oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(268, 265, '22oz Sub-oat', 'Drink Variant', 'other', 199.00, 1),
(269, 266, '16oz Regular', 'Drink Variant', 'other', 159.00, 1),
(270, 266, '22oz Regular', 'Drink Variant', 'other', 179.00, 1),
(271, 266, '16oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(272, 266, '22oz Sub-oat', 'Drink Variant', 'other', 199.00, 1),
(273, 267, '16oz Regular', 'Drink Variant', 'other', 159.00, 1),
(274, 267, '22oz Regular', 'Drink Variant', 'other', 179.00, 1),
(275, 267, '16oz Sub-oat', 'Drink Variant', 'other', 189.00, 1),
(276, 267, '22oz Sub-oat', 'Drink Variant', 'other', 199.00, 1),
(292, 233, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(293, 234, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(294, 235, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(295, 236, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(296, 237, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(297, 238, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(298, 239, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(299, 240, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(300, 250, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(301, 251, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(302, 252, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(303, 253, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(304, 254, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(305, 255, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(306, 256, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(307, 257, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(308, 258, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(309, 259, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(310, 260, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(311, 261, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(312, 262, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(313, 263, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(314, 264, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(315, 265, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(316, 266, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(317, 267, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(318, 241, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(319, 242, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(320, 243, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(321, 244, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(322, 245, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(323, 246, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(324, 247, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(325, 248, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(326, 249, 'Extra espresso shot', 'Add-ons', 'add-on', 40.00, 1),
(355, 233, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(356, 234, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(357, 235, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(358, 236, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(359, 237, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(360, 238, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(361, 239, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(362, 240, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(363, 250, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(364, 251, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(365, 252, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(366, 253, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(367, 254, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(368, 255, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(369, 256, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(370, 257, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(371, 258, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(372, 259, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(373, 260, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(374, 261, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(375, 262, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(376, 263, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(377, 264, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(378, 265, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(379, 266, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(380, 267, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(381, 241, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(382, 242, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(383, 243, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(384, 244, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(385, 245, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(386, 246, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(387, 247, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(388, 248, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(389, 249, 'Sugar syrup', 'Add-ons', 'add-on', 20.00, 1),
(418, 233, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(419, 234, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(420, 235, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(421, 236, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(422, 237, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(423, 238, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(424, 239, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(425, 240, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(426, 250, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(427, 251, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(428, 252, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(429, 253, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(430, 254, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(431, 255, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(432, 256, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(433, 257, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(434, 258, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(435, 259, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(436, 260, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(437, 261, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(438, 262, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(439, 263, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(440, 264, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(441, 265, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(442, 266, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(443, 267, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(444, 241, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(445, 242, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(446, 243, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(447, 244, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(448, 245, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(449, 246, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(450, 247, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(451, 248, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(452, 249, 'Flavored syrup', 'Add-ons', 'add-on', 20.00, 1),
(481, 208, 'Carbonara', 'Flavor', 'other', 0.00, 1),
(482, 208, 'Cheese', 'Flavor', 'other', 0.00, 1),
(483, 209, 'Carbonara', 'Flavor', 'other', 0.00, 1),
(484, 209, 'Cheese', 'Flavor', 'other', 0.00, 1),
(485, 268, 'Small', 'Tray Size', 'size', 550.00, 1),
(486, 268, 'Medium', 'Tray Size', 'size', 800.00, 1),
(487, 268, 'Large', 'Tray Size', 'size', 950.00, 1),
(488, 268, 'XL', 'Tray Size', 'size', 1100.00, 1),
(489, 269, 'Small', 'Tray Size', 'size', 600.00, 1),
(490, 269, 'Medium', 'Tray Size', 'size', 850.00, 1),
(491, 269, 'Large', 'Tray Size', 'size', 1000.00, 1),
(492, 269, 'XL', 'Tray Size', 'size', 1200.00, 1),
(493, 238, 'Roasted Almond', 'Flavor', 'other', 0.00, 1),
(494, 238, 'Caramel Macchiato', 'Flavor', 'other', 0.00, 1),
(495, 238, 'Salted Caramel', 'Flavor', 'other', 0.00, 1),
(496, 238, 'Mocha', 'Flavor', 'other', 0.00, 1),
(497, 238, 'Hazelnut', 'Flavor', 'other', 0.00, 1),
(498, 238, 'Macadamia', 'Flavor', 'other', 0.00, 1),
(499, 238, '12oz Regular', 'Drink Variant', 'other', 139.00, 1),
(500, 238, '12oz Sub-oat', 'Drink Variant', 'other', 159.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_items`
--

CREATE TABLE `inventory_items` (
  `inventory_id` int(11) NOT NULL,
  `item_name` varchar(150) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `quantity` decimal(10,2) DEFAULT 0.00,
  `par_level` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_transactions`
--

CREATE TABLE `inventory_transactions` (
  `transaction_id` int(11) NOT NULL,
  `inventory_id` int(11) NOT NULL,
  `transaction_type` enum('stock-in','sale','waste','adjustment') NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `menu_item_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`menu_item_id`, `category_id`, `product_name`, `description`, `price`, `image`, `is_available`, `created_at`, `updated_at`) VALUES
(188, 50, 'Sisilog', NULL, 140.00, NULL, 1, '2026-09-06 10:49:29', '2026-09-06 10:49:29'),
(189, 50, 'Spamsilog', NULL, 140.00, NULL, 1, '2026-09-06 10:49:29', '2026-09-06 10:49:29'),
(190, 50, 'Longsilog', NULL, 140.00, NULL, 1, '2026-09-06 10:49:29', '2026-09-06 10:49:29'),
(191, 50, 'Tapsilog', NULL, 140.00, NULL, 1, '2026-09-06 10:49:29', '2026-09-06 10:49:29'),
(192, 51, 'Sisig', NULL, 120.00, NULL, 1, '2026-09-06 10:50:30', '2026-09-06 10:50:30'),
(193, 51, 'Menudo', NULL, 120.00, NULL, 1, '2026-09-06 10:50:30', '2026-09-06 10:50:30'),
(194, 51, 'Giniling', NULL, 120.00, NULL, 1, '2026-09-06 10:50:30', '2026-09-06 10:50:30'),
(195, 51, 'Pork Caldereta', NULL, 130.00, NULL, 1, '2026-09-06 10:50:30', '2026-09-06 10:50:30'),
(196, 52, 'Palabok', NULL, 110.00, NULL, 1, '2026-09-06 10:51:06', '2026-09-06 10:51:06'),
(197, 52, 'Cheesy Bacon Fries', NULL, 100.00, NULL, 1, '2026-09-06 10:51:06', '2026-09-06 10:51:06'),
(198, 52, 'Quesadilla', NULL, 110.00, NULL, 1, '2026-09-06 10:51:06', '2026-09-06 10:51:06'),
(199, 52, 'Beefy Nachos', NULL, 135.00, NULL, 1, '2026-09-06 10:51:06', '2026-09-06 10:51:06'),
(200, 53, 'Clubhouse Sandwich', NULL, 130.00, NULL, 1, '2026-09-06 10:51:33', '2026-09-06 10:51:33'),
(201, 53, 'Croissandwich', NULL, 150.00, NULL, 1, '2026-09-06 10:51:33', '2026-09-06 10:51:33'),
(202, 53, 'Classic Burger', NULL, 110.00, NULL, 1, '2026-09-06 10:51:33', '2026-09-06 10:51:33'),
(203, 53, 'Cheese Burger', NULL, 125.00, NULL, 1, '2026-09-06 10:51:33', '2026-09-06 10:51:33'),
(204, 53, 'Bacon & Cheese Burger', NULL, 140.00, NULL, 1, '2026-09-06 10:51:33', '2026-09-06 10:51:33'),
(205, 54, 'Baked Macaroni', NULL, 115.00, NULL, 1, '2026-09-06 10:52:00', '2026-09-06 10:52:00'),
(206, 54, 'Carbonara', NULL, 150.00, NULL, 1, '2026-09-06 10:52:00', '2026-09-06 10:52:00'),
(207, 54, 'Tuna Pesto', NULL, 180.00, NULL, 1, '2026-09-06 10:52:00', '2026-09-06 10:52:00'),
(208, 55, 'SC 1 - Buldak', 'Buldak with cheese sauce and nori', 130.00, NULL, 1, '2026-09-06 10:53:07', '2026-09-06 10:53:07'),
(209, 55, 'SC 2 - Overload Buldak', 'Buldak with cheese sauce, Korean spam, egg and nori', 150.00, NULL, 1, '2026-09-06 10:53:07', '2026-09-06 10:53:07'),
(210, 56, 'Croffle - Strawberry', 'Croffle', 110.00, NULL, 1, '2026-09-06 10:53:51', '2026-09-10 06:39:00'),
(211, 56, 'Croffle - Blueberry', 'Croffle', 110.00, NULL, 1, '2026-09-06 10:53:51', '2026-09-10 06:39:48'),
(212, 56, 'Croffle - Choco-Oreo', 'Croffle', 120.00, NULL, 1, '2026-09-06 10:53:51', '2026-09-10 06:40:00'),
(213, 56, 'Croffle - Biscoff', 'Croffle', 140.00, NULL, 1, '2026-09-06 10:53:51', '2026-09-10 06:40:11'),
(214, 56, 'Croffle - Nutella-Almond', 'Croffle', 140.00, NULL, 1, '2026-09-06 10:53:51', '2026-09-10 06:40:50'),
(215, 56, 'Waffle - Classic', 'Waffle', 90.00, NULL, 1, '2026-09-06 10:53:51', '2026-09-10 06:40:58'),
(216, 56, 'Waffle - Choco-Oreo', 'Waffle', 100.00, NULL, 1, '2026-09-06 10:53:51', '2026-09-10 06:41:05'),
(217, 56, 'Waffle - Biscoff', 'Waffle', 110.00, NULL, 1, '2026-09-06 10:53:51', '2026-09-10 06:41:10'),
(218, 56, 'Waffle - Nutella-Almond', 'Waffle', 110.00, NULL, 1, '2026-09-06 10:53:51', '2026-09-10 06:41:18'),
(219, 57, 'Milo-Dino', NULL, 99.00, NULL, 1, '2026-09-06 11:08:54', '2026-09-06 11:08:54'),
(220, 57, 'Iced Choco', NULL, 199.00, NULL, 1, '2026-09-06 11:08:54', '2026-09-06 11:08:54'),
(221, 57, 'Strawberry Milk', NULL, 199.00, NULL, 1, '2026-09-06 11:08:54', '2026-09-06 11:08:54'),
(222, 57, 'Blueberry Milk', NULL, 199.00, NULL, 1, '2026-09-06 11:08:54', '2026-09-06 11:08:54'),
(223, 57, 'Matcha', NULL, 129.00, NULL, 1, '2026-09-06 11:08:54', '2026-09-06 11:08:54'),
(224, 57, 'Hojicha', NULL, 129.00, NULL, 1, '2026-09-06 11:08:54', '2026-09-06 11:08:54'),
(225, 57, 'Strawberry Matcha', NULL, 139.00, NULL, 1, '2026-09-06 11:08:54', '2026-09-06 11:08:54'),
(226, 57, 'Oreo Milk', NULL, 139.00, NULL, 1, '2026-09-06 11:08:54', '2026-09-06 11:08:54'),
(227, 57, 'Nutella Milk', NULL, 149.00, NULL, 1, '2026-09-06 11:08:54', '2026-09-06 11:08:54'),
(228, 57, 'Biscoff Milk', NULL, 149.00, NULL, 1, '2026-09-06 11:08:54', '2026-09-06 11:08:54'),
(229, 57, 'Matcha Oreo Latte', NULL, 149.00, NULL, 1, '2026-09-06 11:08:54', '2026-09-06 11:08:54'),
(230, 58, 'Lemon Cucumber Tea', NULL, 95.00, NULL, 1, '2026-09-06 11:20:57', '2026-09-06 11:20:57'),
(231, 58, 'Fruit Soda', 'Lychee, Mango, Lemon, Green Apple', 80.00, NULL, 1, '2026-09-06 11:20:57', '2026-09-06 11:20:57'),
(233, 59, 'Hot Americano', NULL, 90.00, NULL, 1, '2026-09-06 11:38:05', '2026-09-06 11:38:05'),
(234, 59, 'Latte', NULL, 119.00, NULL, 1, '2026-09-06 11:38:05', '2026-09-06 11:38:05'),
(235, 59, 'Cappuccino', NULL, 119.00, NULL, 1, '2026-09-06 11:38:05', '2026-09-06 11:38:05'),
(236, 59, 'Hot Chocolate', NULL, 129.00, NULL, 1, '2026-09-06 11:38:05', '2026-09-06 11:38:05'),
(237, 59, 'Spanish Latte', NULL, 129.00, NULL, 1, '2026-09-06 11:38:05', '2026-09-06 11:38:05'),
(238, 59, 'Flavored Latte', 'Roasted Almond, Caramel Macchiato, Salted Caramel, Mocha, Hazelnut, Macadamia', 139.00, NULL, 1, '2026-09-06 11:38:05', '2026-09-06 11:38:05'),
(239, 59, 'Matcha', NULL, 149.00, NULL, 1, '2026-09-06 11:38:05', '2026-09-06 11:38:05'),
(240, 59, 'Hazelnut Mocha', NULL, 149.00, NULL, 1, '2026-09-06 11:38:05', '2026-09-06 11:38:05'),
(241, 65, 'Frappuccino', NULL, 130.00, NULL, 1, '2026-09-07 13:15:28', '2026-09-07 13:15:28'),
(242, 65, 'Salted Caramel', NULL, 130.00, NULL, 1, '2026-09-07 13:15:28', '2026-09-07 13:15:28'),
(243, 65, 'Strawberry', NULL, 130.00, NULL, 1, '2026-09-07 13:15:28', '2026-09-07 13:15:28'),
(244, 65, 'Matcha', NULL, 140.00, NULL, 1, '2026-09-07 13:15:28', '2026-09-07 13:15:28'),
(245, 65, 'Mocha', NULL, 150.00, NULL, 1, '2026-09-07 13:15:28', '2026-09-07 13:15:28'),
(246, 65, 'Oreo Cookie Crumble', NULL, 150.00, NULL, 1, '2026-09-07 13:15:28', '2026-09-07 13:15:28'),
(247, 65, 'Double Chocolate', NULL, 150.00, NULL, 1, '2026-09-07 13:15:28', '2026-09-07 13:15:28'),
(248, 65, 'Java Chip', NULL, 169.00, NULL, 1, '2026-09-07 13:15:28', '2026-09-07 13:15:28'),
(249, 65, 'Biscoff', NULL, 169.00, NULL, 1, '2026-09-07 13:15:28', '2026-09-07 13:15:28'),
(250, 60, 'Cafe Americano', NULL, 109.00, NULL, 1, '2026-09-07 13:22:50', '2026-09-07 13:22:50'),
(251, 60, 'Flavored Café Americano', NULL, 119.00, NULL, 1, '2026-09-07 13:22:50', '2026-09-07 13:22:50'),
(252, 61, 'Latte', NULL, 109.00, NULL, 1, '2026-09-07 13:28:12', '2026-09-07 13:28:12'),
(253, 61, 'Cappuccino', NULL, 119.00, NULL, 1, '2026-09-07 13:28:12', '2026-09-07 13:28:12'),
(254, 61, 'Vanilla', NULL, 119.00, NULL, 1, '2026-09-07 13:28:12', '2026-09-07 13:28:12'),
(255, 61, 'Spanish', NULL, 119.00, NULL, 1, '2026-09-07 13:28:12', '2026-09-07 13:28:12'),
(256, 61, 'Hazelnut', NULL, 129.00, NULL, 1, '2026-09-07 13:28:12', '2026-09-07 13:28:12'),
(257, 61, 'Macadamia', NULL, 129.00, NULL, 1, '2026-09-07 13:28:12', '2026-09-07 13:28:12'),
(258, 61, 'Roasted Almond', NULL, 129.00, NULL, 1, '2026-09-07 13:28:12', '2026-09-07 13:28:12'),
(259, 62, 'Salted Caramel', NULL, 129.00, NULL, 1, '2026-09-07 13:48:22', '2026-09-07 13:48:22'),
(260, 62, 'Caramel Macchiato', NULL, 129.00, NULL, 1, '2026-09-07 13:48:22', '2026-09-07 13:48:22'),
(261, 62, 'Mocha', NULL, 129.00, NULL, 1, '2026-09-07 13:48:22', '2026-09-07 13:48:22'),
(262, 62, 'White Chocolate Mocha', NULL, 129.00, NULL, 1, '2026-09-07 13:48:22', '2026-09-07 13:48:22'),
(263, 62, 'Dolce Cinnamon Latte', NULL, 139.00, NULL, 1, '2026-09-07 13:48:22', '2026-09-07 13:48:22'),
(264, 62, 'Hazelnut Mocha', NULL, 159.00, NULL, 1, '2026-09-07 13:48:22', '2026-09-07 13:48:22'),
(265, 62, 'Dirty Matcha', NULL, 159.00, NULL, 1, '2026-09-07 13:48:22', '2026-09-07 13:48:22'),
(266, 62, 'Nutella Latte', NULL, 159.00, NULL, 1, '2026-09-07 13:48:22', '2026-09-07 13:48:22'),
(267, 62, 'Biscoff Latte', NULL, 159.00, NULL, 1, '2026-09-07 13:48:22', '2026-09-07 13:48:22'),
(268, 63, 'Palabok Party Tray', NULL, 550.00, NULL, 1, '2026-09-07 14:24:23', '2026-09-12 06:31:32'),
(269, 63, 'Baked Mac Party Tray', NULL, 600.00, NULL, 1, '2026-09-07 14:24:23', '2026-09-12 06:31:32');

-- --------------------------------------------------------

--
-- Table structure for table `menu_item_ingredients`
--

CREATE TABLE `menu_item_ingredients` (
  `menu_item_ingredient_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `inventory_id` int(11) NOT NULL,
  `quantity_required` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `order_number` varchar(30) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `order_type` enum('dine-in','take-out') NOT NULL,
  `payment_method` enum('gcash','over-the-counter') NOT NULL,
  `payment_status` enum('pending','verified','rejected','paid') DEFAULT 'pending',
  `payment_proof` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `order_status` enum('pending','confirmed','preparing','ready','completed','cancelled') DEFAULT 'pending',
  `cancellation_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_item_customizations`
--

CREATE TABLE `order_item_customizations` (
  `order_item_customization_id` int(11) NOT NULL,
  `order_item_id` int(11) NOT NULL,
  `customization_name` varchar(100) NOT NULL,
  `customization_type` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','cashier') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `customization_options`
--
ALTER TABLE `customization_options`
  ADD PRIMARY KEY (`customization_id`),
  ADD KEY `menu_item_id` (`menu_item_id`);

--
-- Indexes for table `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD PRIMARY KEY (`inventory_id`);

--
-- Indexes for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`menu_item_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `menu_item_ingredients`
--
ALTER TABLE `menu_item_ingredients`
  ADD PRIMARY KEY (`menu_item_ingredient_id`),
  ADD KEY `menu_item_id` (`menu_item_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `order_number` (`order_number`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `menu_item_id` (`menu_item_id`);

--
-- Indexes for table `order_item_customizations`
--
ALTER TABLE `order_item_customizations`
  ADD PRIMARY KEY (`order_item_customization_id`),
  ADD KEY `order_item_id` (`order_item_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `customization_options`
--
ALTER TABLE `customization_options`
  MODIFY `customization_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=501;

--
-- AUTO_INCREMENT for table `inventory_items`
--
ALTER TABLE `inventory_items`
  MODIFY `inventory_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `menu_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=270;

--
-- AUTO_INCREMENT for table `menu_item_ingredients`
--
ALTER TABLE `menu_item_ingredients`
  MODIFY `menu_item_ingredient_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_item_customizations`
--
ALTER TABLE `order_item_customizations`
  MODIFY `order_item_customization_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customization_options`
--
ALTER TABLE `customization_options`
  ADD CONSTRAINT `customization_options_ibfk_1` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD CONSTRAINT `inventory_transactions_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_items` (`inventory_id`);

--
-- Constraints for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

--
-- Constraints for table `menu_item_ingredients`
--
ALTER TABLE `menu_item_ingredients`
  ADD CONSTRAINT `menu_item_ingredients_ibfk_1` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `menu_item_ingredients_ibfk_2` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_items` (`inventory_id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`menu_item_id`);

--
-- Constraints for table `order_item_customizations`
--
ALTER TABLE `order_item_customizations`
  ADD CONSTRAINT `order_item_customizations_ibfk_1` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`order_item_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
