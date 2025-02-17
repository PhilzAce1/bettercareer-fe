import React from 'react';
import classNames from 'classnames';
import { Container } from '@labs/components';

import { DashboardHeader } from './components/header';

import { Seo } from '@/components/seo';
import { type UserData } from '@/queries/types/user';

import styles from './layout.module.scss';

/**
 * DashboardLayout
 * @description
 * A layout component for the dashboard.
 *
 * @param children - The children to render within the layout.
 * @param title - The title of the page.
 * @param backdropThreshold - The backdropThreshold for the layout backdrop
 *
 * @returns {React.ReactNode} - The rendered component.
 */
export const DashboardLayout = ({
	children,
	title = 'Dashboard',
	backdropThreshold = 'md',
	profile,
}: {
	children: React.ReactNode;
	title?: string;
	backdropThreshold?: 'sm' | 'md' | 'lg';
	profile: UserData | null | undefined;
}) => {
	return (
		<div
			className={classNames([
				styles.DashboardLayout,
				styles[`DashboardLayout--${backdropThreshold}`],
			])}
		>
			<Seo title={title} />
			<nav className={styles.DashboardLayoutHeader}>
				<div className={styles.DashboardLayoutBanner} />

				<DashboardHeader />
			</nav>
			<main className={styles.DashboardLayoutMain}>
				<Container maxWidth="lg">{children}</Container>
			</main>
		</div>
	);
};
