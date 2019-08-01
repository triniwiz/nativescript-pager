import CHIPageControl

@objc extension CHIBasePageControl {
    func animate(progress: NSInteger, animated: Bool) {
        self.set(progress: progress, animated: animated)
    }
}
