-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 2017-07-20 22:13:43
-- 服务器版本： 10.1.21-MariaDB
-- PHP Version: 7.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dms`
--

-- --------------------------------------------------------

--
-- 表的结构 `bed`
--

CREATE TABLE `bed` (
  `id` int(11) NOT NULL COMMENT '序号',
  `buildingNo` int(11) NOT NULL COMMENT '楼号，5/13/14',
  `roomNo` varchar(20) NOT NULL COMMENT '宿舍号',
  `bedNo` int(11) NOT NULL COMMENT '床位编号',
  `sex` int(11) NOT NULL COMMENT '性别，0：女，1：男',
  `status` int(11) NOT NULL COMMENT '0：空床，1：已分配，2：已入住',
  `usable` int(11) NOT NULL DEFAULT '1' COMMENT '0：不可用，1：可用',
  `studentNo` varchar(10) DEFAULT NULL COMMENT '学生学号',
  `studentName` varchar(50) DEFAULT NULL COMMENT '学生姓名',
  `deleteBit` int(11) DEFAULT '0' COMMENT '删除位，1：已删除，0：未删除',
  `remainBit` int(11) DEFAULT NULL COMMENT '保留位'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `bed`
--

INSERT INTO `bed` (`id`, `buildingNo`, `roomNo`, `bedNo`, `sex`, `status`, `usable`, `studentNo`, `studentName`, `deleteBit`, `remainBit`) VALUES
(1, 5, '5114', 1, 1, 0, 1, NULL, NULL, 0, NULL),
(2, 5, '5114', 2, 1, 0, 1, NULL, NULL, 0, NULL),
(3, 5, '5114', 3, 1, 0, 1, NULL, NULL, 0, NULL),
(4, 5, '5114', 4, 1, 2, 0, '1601210494', '戴鹏程', 0, NULL),
(5, 5, '5214', 1, 0, 2, 1, '1601210575', '姜栋煜', 0, NULL),
(6, 5, '5214', 2, 0, 0, 1, NULL, NULL, 0, NULL),
(7, 5, '5214', 3, 0, 0, 1, NULL, NULL, 0, NULL),
(8, 5, '5214', 4, 0, 0, 1, NULL, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- 表的结构 `building`
--

CREATE TABLE `building` (
  `id` int(11) NOT NULL,
  `buildingNo` int(11) NOT NULL COMMENT '楼号',
  `buildingName` varchar(50) NOT NULL COMMENT '楼名',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '状态位，1：可见，0：不可见	',
  `deleteBit` int(11) NOT NULL DEFAULT '0' COMMENT '删除位，1：已删除，0：未删除',
  `remainBit` int(11) DEFAULT NULL COMMENT '保留位'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `building`
--

INSERT INTO `building` (`id`, `buildingNo`, `buildingName`, `status`, `deleteBit`, `remainBit`) VALUES
(1, 5, '5号楼', 1, 0, NULL),
(2, 13, '13号楼', 0, 1, NULL),
(3, 6, '6号楼', 0, 0, NULL);

-- --------------------------------------------------------

--
-- 表的结构 `dorm`
--

CREATE TABLE `dorm` (
  `id` int(11) NOT NULL COMMENT '序号',
  `buildingNo` int(11) NOT NULL COMMENT '楼号，5/13/14',
  `roomNo` varchar(20) NOT NULL COMMENT '宿舍号',
  `deleteBit` int(11) DEFAULT '0' COMMENT '删除位，1：已删除，0：未删除',
  `remainBit` int(11) DEFAULT NULL COMMENT '保留位'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

--
-- 转存表中的数据 `dorm`
--

INSERT INTO `dorm` (`id`, `buildingNo`, `roomNo`, `deleteBit`, `remainBit`) VALUES
(1, 5, '5114', 1, NULL),
(2, 13, 'F1224', 0, NULL),
(3, 5, '5214', 1, NULL),
(4, 14, 'E5214', 0, NULL),
(5, 5, '5210', 1, NULL),
(6, 5, '5421', 1, NULL),
(7, 13, 'E2222', 0, NULL),
(8, 5, 'E2222', 1, NULL),
(9, 5, 'E2222', 1, NULL),
(10, 5, '1111', 1, NULL);

-- --------------------------------------------------------

--
-- 表的结构 `student`
--

CREATE TABLE `student` (
  `id` int(11) NOT NULL,
  `studentNo` varchar(10) NOT NULL COMMENT '学生学号',
  `studentName` varchar(50) NOT NULL COMMENT '学生姓名',
  `sex` int(11) NOT NULL COMMENT '性别，0：女，1：男',
  `code` varchar(6) NOT NULL COMMENT '校验码',
  `deleteBit` int(11) NOT NULL DEFAULT '0' COMMENT '删除位，1：已删除，0：未删除',
  `remainBit` int(11) DEFAULT NULL COMMENT '保留位'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `student`
--

INSERT INTO `student` (`id`, `studentNo`, `studentName`, `sex`, `code`, `deleteBit`, `remainBit`) VALUES
(4, '1601210652', '罗琳', 0, '72hlik', 0, NULL),
(5, '1601210650', '罗夕', 0, '19smbm', 0, NULL),
(6, '1601210575', '姜栋煜', 0, 'uxk5xg', 0, NULL);

-- --------------------------------------------------------

--
-- 表的结构 `time`
--

CREATE TABLE `time` (
  `id` int(11) NOT NULL,
  `limitTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `explain` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

--
-- 转存表中的数据 `time`
--

INSERT INTO `time` (`id`, `limitTime`, `explain`) VALUES
(2, '2017-06-01 04:25:00', 'openTime');

-- --------------------------------------------------------

--
-- 表的结构 `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `user`
--

INSERT INTO `user` (`id`, `username`, `password`) VALUES
(1, 'admin', '191a89ab4d88e784d9c5d0de0a8958b9');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bed`
--
ALTER TABLE `bed`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `building`
--
ALTER TABLE `building`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dorm`
--
ALTER TABLE `dorm`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `studentNo` (`studentNo`);

--
-- Indexes for table `time`
--
ALTER TABLE `time`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `bed`
--
ALTER TABLE `bed`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号', AUTO_INCREMENT=9;
--
-- 使用表AUTO_INCREMENT `building`
--
ALTER TABLE `building`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- 使用表AUTO_INCREMENT `dorm`
--
ALTER TABLE `dorm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '序号', AUTO_INCREMENT=11;
--
-- 使用表AUTO_INCREMENT `student`
--
ALTER TABLE `student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- 使用表AUTO_INCREMENT `time`
--
ALTER TABLE `time`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- 使用表AUTO_INCREMENT `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
