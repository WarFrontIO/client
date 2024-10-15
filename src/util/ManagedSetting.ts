export interface ManagedSetting {
	/**
	 * Returns a string representation of this settings value.
	 */
	toString(): string;

	/**
	 * Parses a string to set the value of this setting.
	 */
	fromString(value: string): void;
}