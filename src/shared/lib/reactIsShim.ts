import { Fragment, isValidElement, type ReactNode } from "react";

export function isFragment(value: ReactNode): boolean {
	return isValidElement(value) && value.type === Fragment;
}

const reactIsShim = {
	isFragment,
};

export default reactIsShim;